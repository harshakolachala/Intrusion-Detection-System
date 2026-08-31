"""Aggregate FedSentry IEEE experiment outputs into paper-ready statistics."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np


METRICS = [
    "accuracy",
    "weighted_precision",
    "weighted_recall",
    "weighted_f1",
    "macro_precision",
    "macro_recall",
    "macro_f1",
    "evaluation_seconds",
    "throughput_samples_per_second",
]


def load_summaries(root: Path) -> list[dict]:
    summaries = []
    for path in sorted(root.glob("*/summary.json")):
        with path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
            payload["_path"] = str(path)
            summaries.append(payload)
    if not summaries:
        raise FileNotFoundError(f"No */summary.json files found under {root}")
    return summaries


def aggregate_group(rows: list[dict]) -> dict:
    result: dict = {"runs": len(rows)}
    for metric in METRICS:
        values = np.asarray([row["final_metrics"][metric] for row in rows], dtype=float)
        result[metric] = {
            "mean": float(values.mean()),
            "std": float(values.std(ddof=1)) if len(values) > 1 else 0.0,
            "min": float(values.min()),
            "max": float(values.max()),
        }

    communications = np.asarray(
        [row["total_communication_megabytes"] for row in rows], dtype=float
    )
    durations = np.asarray([row["total_experiment_seconds"] for row in rows], dtype=float)
    result["communication_mb"] = {
        "mean": float(communications.mean()),
        "std": float(communications.std(ddof=1)) if len(communications) > 1 else 0.0,
    }
    result["experiment_seconds"] = {
        "mean": float(durations.mean()),
        "std": float(durations.std(ddof=1)) if len(durations) > 1 else 0.0,
    }
    return result


def paper_value(value: dict, percent: bool = True) -> str:
    scale = 100.0 if percent else 1.0
    return f"{value['mean'] * scale:.2f} ± {value['std'] * scale:.2f}"


def write_outputs(root: Path, summaries: list[dict]) -> None:
    groups: dict[str, list[dict]] = {}
    for row in summaries:
        groups.setdefault(row["config"]["partition"], []).append(row)

    aggregated = {name: aggregate_group(rows) for name, rows in groups.items()}
    with (root / "statistical_summary.json").open("w", encoding="utf-8") as handle:
        json.dump(aggregated, handle, indent=2)

    csv_path = root / "paper_summary.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "partition",
                "runs",
                "accuracy_mean_std_pct",
                "weighted_f1_mean_std_pct",
                "macro_f1_mean_std_pct",
                "communication_mb_mean_std",
                "experiment_seconds_mean_std",
            ]
        )
        for partition, stats in sorted(aggregated.items()):
            writer.writerow(
                [
                    partition,
                    stats["runs"],
                    paper_value(stats["accuracy"]),
                    paper_value(stats["weighted_f1"]),
                    paper_value(stats["macro_f1"]),
                    paper_value(stats["communication_mb"], percent=False),
                    paper_value(stats["experiment_seconds"], percent=False),
                ]
            )

    markdown = [
        "# FedSentry IEEE Experiment Summary",
        "",
        "Values below are mean ± sample standard deviation across independent seeds.",
        "",
        "| Partition | Runs | Accuracy (%) | Weighted F1 (%) | Macro F1 (%) | Communication (MB) | Runtime (s) |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for partition, stats in sorted(aggregated.items()):
        markdown.append(
            "| {partition} | {runs} | {accuracy} | {weighted_f1} | {macro_f1} | {comm} | {runtime} |".format(
                partition=partition,
                runs=stats["runs"],
                accuracy=paper_value(stats["accuracy"]),
                weighted_f1=paper_value(stats["weighted_f1"]),
                macro_f1=paper_value(stats["macro_f1"]),
                comm=paper_value(stats["communication_mb"], percent=False),
                runtime=paper_value(stats["experiment_seconds"], percent=False),
            )
        )

    if "iid" in aggregated and "non_iid" in aggregated:
        iid = aggregated["iid"]
        non_iid = aggregated["non_iid"]
        markdown.extend(
            [
                "",
                "## IID vs non-IID effect",
                "",
                f"Accuracy change: {(non_iid['accuracy']['mean'] - iid['accuracy']['mean']) * 100:.2f} percentage points.",
                f"Weighted-F1 change: {(non_iid['weighted_f1']['mean'] - iid['weighted_f1']['mean']) * 100:.2f} percentage points.",
                f"Macro-F1 change: {(non_iid['macro_f1']['mean'] - iid['macro_f1']['mean']) * 100:.2f} percentage points.",
            ]
        )

    (root / "paper_summary.md").write_text("\n".join(markdown) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Summarize FedSentry IEEE experiment runs")
    parser.add_argument("--results", default="results/ieee")
    args = parser.parse_args()
    root = Path(args.results)
    summaries = load_summaries(root)
    write_outputs(root, summaries)
    print(f"Paper-ready summaries written to {root.resolve()}")


if __name__ == "__main__":
    main()
