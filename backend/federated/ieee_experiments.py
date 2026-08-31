"""Reproducible IEEE-oriented experiment runner for FedSentry.

This module intentionally runs federated learning in-process so that the same
training/evaluation protocol can be repeated deterministically across IID and
non-IID partitions without coordinating multiple terminals. It complements the
Flower production/research server and does not replace it.

Outputs per experiment:
- per-round accuracy, macro/weighted precision, recall and F1
- communication bytes per round and cumulative communication
- client label-distribution diagnostics
- final confusion matrix and classification report
- run metadata including seed and partition strategy

Example from backend/:
    python -m federated.ieee_experiments --partition both --seeds 42 52 62

Use --development while validating the pipeline before running the full dataset.
"""

from __future__ import annotations

import argparse
import copy
import csv
import json
import os
import random
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)
from torch.utils.data import DataLoader, TensorDataset

from federated.dataset import IDSDataset
from federated.model import MLPIDS


@dataclass
class ExperimentConfig:
    csv_path: str = "datasets/combinenew.csv"
    num_clients: int = 3
    rounds: int = 10
    local_epochs: int = 5
    batch_size: int = 64
    learning_rate: float = 1e-3
    partition: str = "iid"
    dirichlet_alpha: float = 0.3
    seed: int = 42
    development: bool = False
    sample_size: int = 100_000
    output_dir: str = "results/ieee"


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    try:
        torch.use_deterministic_algorithms(True, warn_only=True)
    except TypeError:
        # Older supported torch releases may not expose warn_only.
        torch.use_deterministic_algorithms(True)


def model_num_bytes(model: nn.Module) -> int:
    return sum(parameter.numel() * parameter.element_size() for parameter in model.parameters())


def iid_partition(y: np.ndarray, num_clients: int, seed: int) -> list[np.ndarray]:
    rng = np.random.default_rng(seed)
    shuffled = rng.permutation(len(y))
    return [chunk.astype(np.int64) for chunk in np.array_split(shuffled, num_clients)]


def dirichlet_partition(
    y: np.ndarray,
    num_clients: int,
    alpha: float,
    seed: int,
    min_client_samples: int = 64,
    max_attempts: int = 100,
) -> list[np.ndarray]:
    """Create label-skewed non-IID partitions using a Dirichlet distribution."""
    if alpha <= 0:
        raise ValueError("Dirichlet alpha must be positive.")

    rng = np.random.default_rng(seed)
    classes = np.unique(y)

    for _ in range(max_attempts):
        buckets: list[list[int]] = [[] for _ in range(num_clients)]

        for class_id in classes:
            class_indices = np.flatnonzero(y == class_id)
            rng.shuffle(class_indices)
            proportions = rng.dirichlet(np.full(num_clients, alpha))
            split_points = (np.cumsum(proportions)[:-1] * len(class_indices)).astype(int)
            class_splits = np.split(class_indices, split_points)
            for client_id, client_split in enumerate(class_splits):
                buckets[client_id].extend(client_split.tolist())

        partitions = [np.asarray(indices, dtype=np.int64) for indices in buckets]
        if min(len(indices) for indices in partitions) >= min_client_samples:
            for indices in partitions:
                rng.shuffle(indices)
            return partitions

    raise RuntimeError(
        "Could not create a valid non-IID partition. Increase alpha, reduce the "
        "number of clients, or lower min_client_samples."
    )


def describe_partitions(y: np.ndarray, partitions: list[np.ndarray]) -> list[dict]:
    descriptions: list[dict] = []
    for client_id, indices in enumerate(partitions):
        labels, counts = np.unique(y[indices], return_counts=True)
        total = max(len(indices), 1)
        descriptions.append(
            {
                "client_id": client_id,
                "samples": int(len(indices)),
                "label_counts": {str(int(label)): int(count) for label, count in zip(labels, counts)},
                "label_proportions": {
                    str(int(label)): round(float(count / total), 8)
                    for label, count in zip(labels, counts)
                },
            }
        )
    return descriptions


def class_weights(y: np.ndarray, num_classes: int) -> torch.Tensor:
    counts = np.bincount(y.astype(np.int64), minlength=num_classes).astype(np.float64)
    counts[counts == 0] = 1.0
    weights = len(y) / (num_classes * counts)
    return torch.tensor(weights, dtype=torch.float32)


def make_loader(
    X: np.ndarray,
    y: np.ndarray,
    indices: np.ndarray,
    batch_size: int,
    shuffle: bool,
) -> DataLoader:
    dataset = TensorDataset(
        torch.tensor(X[indices], dtype=torch.float32),
        torch.tensor(y[indices], dtype=torch.long),
    )
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, drop_last=False)


def train_local(
    model: nn.Module,
    loader: DataLoader,
    weights: torch.Tensor,
    epochs: int,
    learning_rate: float,
    device: torch.device,
) -> tuple[nn.Module, float]:
    model = model.to(device)
    model.train()
    criterion = nn.CrossEntropyLoss(weight=weights.to(device))
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    running_loss = 0.0
    examples = 0
    for _ in range(epochs):
        for features, labels in loader:
            features = features.to(device)
            labels = labels.to(device)
            optimizer.zero_grad(set_to_none=True)
            logits = model(features)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += float(loss.item()) * len(labels)
            examples += len(labels)

    return model.cpu(), running_loss / max(examples, 1)


def fedavg(models: list[nn.Module], sample_counts: list[int]) -> dict[str, torch.Tensor]:
    total = float(sum(sample_counts))
    if total <= 0:
        raise ValueError("Cannot aggregate empty client updates.")

    averaged: dict[str, torch.Tensor] = {}
    state_dicts = [model.state_dict() for model in models]
    for key in state_dicts[0]:
        reference = state_dicts[0][key]
        if not torch.is_floating_point(reference):
            # BatchNorm integer counters do not benefit from arithmetic averaging.
            averaged[key] = reference.clone()
            continue
        accumulator = torch.zeros_like(reference, dtype=torch.float64)
        for state, count in zip(state_dicts, sample_counts):
            accumulator += state[key].detach().to(torch.float64) * (count / total)
        averaged[key] = accumulator.to(reference.dtype)
    return averaged


def evaluate_model(
    model: nn.Module,
    X_test: np.ndarray,
    y_test: np.ndarray,
    batch_size: int,
    device: torch.device,
) -> tuple[dict, np.ndarray, dict]:
    loader = DataLoader(
        TensorDataset(
            torch.tensor(X_test, dtype=torch.float32),
            torch.tensor(y_test, dtype=torch.long),
        ),
        batch_size=batch_size,
        shuffle=False,
    )
    model = model.to(device)
    model.eval()
    predictions: list[np.ndarray] = []

    started = time.perf_counter()
    with torch.no_grad():
        for features, _ in loader:
            logits = model(features.to(device))
            predictions.append(torch.argmax(logits, dim=1).cpu().numpy())
    elapsed = time.perf_counter() - started

    y_pred = np.concatenate(predictions) if predictions else np.asarray([], dtype=np.int64)
    weighted = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )
    macro = precision_recall_fscore_support(
        y_test, y_pred, average="macro", zero_division=0
    )
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "weighted_precision": float(weighted[0]),
        "weighted_recall": float(weighted[1]),
        "weighted_f1": float(weighted[2]),
        "macro_precision": float(macro[0]),
        "macro_recall": float(macro[1]),
        "macro_f1": float(macro[2]),
        "evaluation_seconds": float(elapsed),
        "throughput_samples_per_second": float(len(y_test) / elapsed) if elapsed > 0 else 0.0,
    }
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    matrix = confusion_matrix(y_test, y_pred)
    return metrics, matrix, report


def write_round_csv(path: Path, rows: Iterable[dict]) -> None:
    rows = list(rows)
    if not rows:
        return
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def run_experiment(config: ExperimentConfig) -> dict:
    seed_everything(config.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    dataset = IDSDataset(
        csv_path=config.csv_path,
        num_clients=config.num_clients,
        random_state=config.seed,
        development=config.development,
        sample_size=config.sample_size,
        batch_size=config.batch_size,
    )
    X_train, X_test, y_train, y_test = dataset.preprocess()
    y_train = np.asarray(y_train, dtype=np.int64)
    y_test = np.asarray(y_test, dtype=np.int64)

    if config.partition == "iid":
        partitions = iid_partition(y_train, config.num_clients, config.seed)
    elif config.partition == "non_iid":
        partitions = dirichlet_partition(
            y_train,
            config.num_clients,
            config.dirichlet_alpha,
            config.seed,
        )
    else:
        raise ValueError(f"Unsupported partition strategy: {config.partition}")

    num_classes = int(max(np.max(y_train), np.max(y_test))) + 1
    global_model = MLPIDS(input_size=X_train.shape[1], num_classes=num_classes)
    weights = class_weights(y_train, num_classes)
    bytes_per_model = model_num_bytes(global_model)
    round_rows: list[dict] = []
    cumulative_comm = 0
    experiment_started = time.perf_counter()

    for server_round in range(1, config.rounds + 1):
        client_models: list[nn.Module] = []
        client_sizes: list[int] = []
        client_losses: list[float] = []
        round_started = time.perf_counter()

        for indices in partitions:
            local_model = copy.deepcopy(global_model)
            loader = make_loader(
                X_train,
                y_train,
                indices,
                config.batch_size,
                shuffle=True,
            )
            local_model, local_loss = train_local(
                local_model,
                loader,
                weights,
                config.local_epochs,
                config.learning_rate,
                device,
            )
            client_models.append(local_model)
            client_sizes.append(int(len(indices)))
            client_losses.append(local_loss)

        global_model.load_state_dict(fedavg(client_models, client_sizes), strict=True)
        metrics, _, _ = evaluate_model(
            global_model, X_test, y_test, config.batch_size * 4, device
        )

        # Per client: one global-model download and one local-model upload.
        round_comm = bytes_per_model * config.num_clients * 2
        cumulative_comm += round_comm
        round_rows.append(
            {
                "round": server_round,
                "partition": config.partition,
                "seed": config.seed,
                "train_loss": float(np.average(client_losses, weights=client_sizes)),
                **metrics,
                "round_seconds": float(time.perf_counter() - round_started),
                "model_bytes": bytes_per_model,
                "communication_bytes_round": round_comm,
                "communication_mb_round": round_comm / (1024 * 1024),
                "communication_mb_cumulative": cumulative_comm / (1024 * 1024),
            }
        )
        latest = round_rows[-1]
        print(
            f"[{config.partition} seed={config.seed}] round {server_round:02d}/{config.rounds} "
            f"acc={latest['accuracy']:.4f} macro_f1={latest['macro_f1']:.4f} "
            f"weighted_f1={latest['weighted_f1']:.4f}"
        )

    final_metrics, matrix, report = evaluate_model(
        global_model, X_test, y_test, config.batch_size * 4, device
    )

    run_name = f"{config.partition}_seed_{config.seed}"
    run_dir = Path(config.output_dir) / run_name
    run_dir.mkdir(parents=True, exist_ok=True)
    write_round_csv(run_dir / "round_metrics.csv", round_rows)
    np.savetxt(run_dir / "confusion_matrix.csv", matrix, fmt="%d", delimiter=",")
    with (run_dir / "classification_report.json").open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)

    result = {
        "config": asdict(config),
        "device": str(device),
        "input_features": int(X_train.shape[1]),
        "num_classes": num_classes,
        "train_samples": int(len(y_train)),
        "test_samples": int(len(y_test)),
        "model_parameters": int(sum(p.numel() for p in global_model.parameters())),
        "model_bytes": int(bytes_per_model),
        "model_megabytes": bytes_per_model / (1024 * 1024),
        "partition_diagnostics": describe_partitions(y_train, partitions),
        "round_metrics": round_rows,
        "final_metrics": final_metrics,
        "total_communication_bytes": int(cumulative_comm),
        "total_communication_megabytes": cumulative_comm / (1024 * 1024),
        "total_experiment_seconds": float(time.perf_counter() - experiment_started),
    }
    with (run_dir / "summary.json").open("w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2)
    torch.save(global_model.state_dict(), run_dir / "global_model.pt")
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="FedSentry IEEE federated experiment suite")
    parser.add_argument("--csv", default="datasets/combinenew.csv")
    parser.add_argument("--partition", choices=["iid", "non_iid", "both"], default="both")
    parser.add_argument("--seeds", nargs="+", type=int, default=[42, 52, 62])
    parser.add_argument("--clients", type=int, default=3)
    parser.add_argument("--rounds", type=int, default=10)
    parser.add_argument("--local-epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--alpha", type=float, default=0.3)
    parser.add_argument("--development", action="store_true")
    parser.add_argument("--sample-size", type=int, default=100_000)
    parser.add_argument("--output-dir", default="results/ieee")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    partitions = ["iid", "non_iid"] if args.partition == "both" else [args.partition]
    all_results: list[dict] = []

    for partition in partitions:
        for seed in args.seeds:
            config = ExperimentConfig(
                csv_path=args.csv,
                num_clients=args.clients,
                rounds=args.rounds,
                local_epochs=args.local_epochs,
                batch_size=args.batch_size,
                learning_rate=args.lr,
                partition=partition,
                dirichlet_alpha=args.alpha,
                seed=seed,
                development=args.development,
                sample_size=args.sample_size,
                output_dir=args.output_dir,
            )
            all_results.append(run_experiment(config))

    manifest = Path(args.output_dir)
    manifest.mkdir(parents=True, exist_ok=True)
    with (manifest / "experiment_manifest.json").open("w", encoding="utf-8") as handle:
        json.dump(all_results, handle, indent=2)

    print(f"\nCompleted {len(all_results)} experiment runs. Results: {manifest.resolve()}")


if __name__ == "__main__":
    main()
