"""Class-imbalance ablation study for FedSentry IEEE evaluation.

Compares identical centralized MLP training under:
1) standard cross-entropy
2) class-weighted cross-entropy
3) focal loss

This isolates the effect of the imbalance-handling objective while holding the
architecture, preprocessing, split, optimizer and training budget constant.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from federated.dataset import IDSDataset
from federated.ieee_experiments import class_weights, evaluate_model, seed_everything
from federated.model import MLPIDS


class FocalLoss(nn.Module):
    def __init__(self, gamma: float = 2.0, weight: torch.Tensor | None = None):
        super().__init__()
        self.gamma = gamma
        self.weight = weight

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        ce = nn.functional.cross_entropy(
            logits,
            targets,
            weight=self.weight.to(logits.device) if self.weight is not None else None,
            reduction="none",
        )
        pt = torch.exp(-ce)
        return (((1.0 - pt) ** self.gamma) * ce).mean()


def make_criterion(name: str, weights: torch.Tensor) -> nn.Module:
    if name == "cross_entropy":
        return nn.CrossEntropyLoss()
    if name == "weighted_cross_entropy":
        return nn.CrossEntropyLoss(weight=weights)
    if name == "focal":
        return FocalLoss(gamma=2.0, weight=weights)
    raise ValueError(f"Unknown loss: {name}")


def train(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    epochs: int,
    learning_rate: float,
    device: torch.device,
) -> list[float]:
    model.to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    history: list[float] = []
    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        total_examples = 0
        for features, labels in loader:
            features = features.to(device)
            labels = labels.to(device)
            optimizer.zero_grad(set_to_none=True)
            logits = model(features)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            total_loss += float(loss.item()) * len(labels)
            total_examples += len(labels)
        epoch_loss = total_loss / max(total_examples, 1)
        history.append(epoch_loss)
        print(f"epoch={epoch + 1}/{epochs} loss={epoch_loss:.6f}")
    return history


def run_one(args: argparse.Namespace, seed: int, loss_name: str) -> dict:
    seed_everything(seed)
    dataset = IDSDataset(
        csv_path=args.csv,
        random_state=seed,
        development=args.development,
        sample_size=args.sample_size,
        batch_size=args.batch_size,
    )
    X_train, X_test, y_train, y_test = dataset.preprocess()
    y_train = np.asarray(y_train, dtype=np.int64)
    y_test = np.asarray(y_test, dtype=np.int64)
    num_classes = int(max(np.max(y_train), np.max(y_test))) + 1
    model = MLPIDS(input_size=X_train.shape[1], num_classes=num_classes)
    weights = class_weights(y_train, num_classes)
    criterion = make_criterion(loss_name, weights)
    loader = DataLoader(
        TensorDataset(
            torch.tensor(X_train, dtype=torch.float32),
            torch.tensor(y_train, dtype=torch.long),
        ),
        batch_size=args.batch_size,
        shuffle=True,
    )
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    started = time.perf_counter()
    history = train(model, loader, criterion, args.epochs, args.lr, device)
    metrics, matrix, report = evaluate_model(
        model, X_test, y_test, args.batch_size * 4, device
    )
    return {
        "seed": seed,
        "loss": loss_name,
        "epochs": args.epochs,
        "training_seconds": time.perf_counter() - started,
        "train_loss_history": history,
        "final_metrics": metrics,
        "confusion_matrix": matrix.tolist(),
        "classification_report": report,
    }


def summarize(results: list[dict]) -> list[dict]:
    rows = []
    for loss_name in sorted({row["loss"] for row in results}):
        group = [row for row in results if row["loss"] == loss_name]
        summary = {"loss": loss_name, "runs": len(group)}
        for metric in ["accuracy", "weighted_f1", "macro_f1", "macro_recall", "macro_precision"]:
            values = np.asarray([row["final_metrics"][metric] for row in group], dtype=float)
            summary[f"{metric}_mean"] = float(values.mean())
            summary[f"{metric}_std"] = float(values.std(ddof=1)) if len(values) > 1 else 0.0
        rows.append(summary)
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="FedSentry imbalance-loss ablation")
    parser.add_argument("--csv", default="datasets/combinenew.csv")
    parser.add_argument("--seeds", nargs="+", type=int, default=[42, 52, 62])
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--development", action="store_true")
    parser.add_argument("--sample-size", type=int, default=100_000)
    parser.add_argument("--output", default="results/ieee/ablation")
    args = parser.parse_args()

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    losses = ["cross_entropy", "weighted_cross_entropy", "focal"]
    results: list[dict] = []

    for seed in args.seeds:
        for loss_name in losses:
            print(f"\n=== loss={loss_name} seed={seed} ===")
            results.append(run_one(args, seed, loss_name))

    summary = summarize(results)
    (output / "ablation_results.json").write_text(
        json.dumps({"runs": results, "summary": summary}, indent=2), encoding="utf-8"
    )
    with (output / "ablation_summary.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(summary[0].keys()))
        writer.writeheader()
        writer.writerows(summary)
    print(f"Ablation outputs written to {output.resolve()}")


if __name__ == "__main__":
    main()
