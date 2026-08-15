"""
Final IEEE Evaluation for the Federated IDS Model.

Uses:
    models/global_model.pth
    federated/prepared_data/test.pt
    federated/label_mapping.json

Generates:
    results/final_metrics.json
    results/classification_report.txt
    results/confusion_matrix.csv
    results/per_class_metrics.csv
    results/convergence.csv
    results/convergence.png

No training is performed.
"""

import csv
import json
import os
import time

import matplotlib.pyplot as plt
import numpy as np
import torch

from torch.utils.data import TensorDataset, DataLoader

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

from federated.config import (
    INPUT_SIZE,
    NUM_CLASSES,
    BATCH_SIZE,
    MODEL_PATH,
    NUM_CLIENTS,
    NUM_ROUNDS,
    LOCAL_EPOCHS,
    LEARNING_RATE,
)

from federated.model import MLPIDS


# =========================================================
# Paths
# =========================================================

RESULTS_DIR = "results"

TEST_PATH = (
    "federated/prepared_data/test.pt"
)

LABEL_MAPPING_PATH = (
    "federated/label_mapping.json"
)


# =========================================================
# Create Results Directory
# =========================================================

os.makedirs(
    RESULTS_DIR,
    exist_ok=True,
)


# =========================================================
# Load Label Mapping
# =========================================================

with open(
    LABEL_MAPPING_PATH,
    "r",
    encoding="utf-8",
) as file:

    mapping = json.load(file)


class_names = [
    mapping[str(i)]
    for i in range(NUM_CLASSES)
]


# =========================================================
# Load Test Dataset
# =========================================================

print("=" * 70)
print("FINAL FEDERATED IDS EVALUATION")
print("=" * 70)

print("\nLoading test dataset...")

test_data = torch.load(
    TEST_PATH,
    map_location="cpu",
    weights_only=False,
)

X_test = test_data["features"]
y_test = test_data["labels"]

print(
    f"Test samples : {len(X_test):,}"
)

print(
    f"Features     : {X_test.shape[1]}"
)

print(
    f"Classes      : {NUM_CLASSES}"
)


# =========================================================
# Validate Test Dataset
# =========================================================

if X_test.shape[1] != INPUT_SIZE:

    raise ValueError(
        f"Expected {INPUT_SIZE} features, "
        f"received {X_test.shape[1]}."
    )


test_dataset = TensorDataset(
    X_test,
    y_test,
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
)


# =========================================================
# Load Final Global Model
# =========================================================

print("\nLoading final global model...")

model = MLPIDS(
    input_size=INPUT_SIZE,
    num_classes=NUM_CLASSES,
)

state_dict = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)

model.load_state_dict(
    state_dict,
    strict=True,
)

model.eval()

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

model.to(device)

print(
    f"Device       : {device}"
)

print(
    f"Model        : {MODEL_PATH}"
)


# =========================================================
# Final Inference
# =========================================================

print("\nRunning final evaluation...")

all_labels = []
all_predictions = []

inference_start = time.perf_counter()

with torch.no_grad():

    for features, labels in test_loader:

        features = features.to(device)

        outputs = model(
            features
        )

        predictions = torch.argmax(
            outputs,
            dim=1,
        )

        all_labels.extend(
            labels.numpy()
        )

        all_predictions.extend(
            predictions.cpu().numpy()
        )


inference_end = time.perf_counter()

total_inference_time = (
    inference_end
    - inference_start
)

all_labels = np.asarray(
    all_labels
)

all_predictions = np.asarray(
    all_predictions
)


# =========================================================
# Overall Metrics
# =========================================================

accuracy = accuracy_score(
    all_labels,
    all_predictions,
)

weighted_precision = precision_score(
    all_labels,
    all_predictions,
    average="weighted",
    zero_division=0,
)

weighted_recall = recall_score(
    all_labels,
    all_predictions,
    average="weighted",
    zero_division=0,
)

weighted_f1 = f1_score(
    all_labels,
    all_predictions,
    average="weighted",
    zero_division=0,
)

macro_precision = precision_score(
    all_labels,
    all_predictions,
    average="macro",
    zero_division=0,
)

macro_recall = recall_score(
    all_labels,
    all_predictions,
    average="macro",
    zero_division=0,
)

macro_f1 = f1_score(
    all_labels,
    all_predictions,
    average="macro",
    zero_division=0,
)


# =========================================================
# Confusion Matrix
# =========================================================

cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=list(range(NUM_CLASSES)),
)


# =========================================================
# Classification Report
# =========================================================

report_text = classification_report(
    all_labels,
    all_predictions,
    labels=list(range(NUM_CLASSES)),
    target_names=class_names,
    digits=6,
    zero_division=0,
)


# =========================================================
# Per-Class Metrics
# =========================================================

report_dict = classification_report(
    all_labels,
    all_predictions,
    labels=list(range(NUM_CLASSES)),
    target_names=class_names,
    output_dict=True,
    zero_division=0,
)


# =========================================================
# Save Classification Report
# =========================================================

classification_report_path = os.path.join(
    RESULTS_DIR,
    "classification_report.txt",
)

with open(
    classification_report_path,
    "w",
    encoding="utf-8",
) as file:

    file.write(
        "SentinelAI Federated IDS\n"
    )

    file.write(
        "Final 15-Class Evaluation\n"
    )

    file.write(
        "=" * 70 + "\n\n"
    )

    file.write(
        report_text
    )


# =========================================================
# Save Confusion Matrix
# =========================================================

confusion_matrix_path = os.path.join(
    RESULTS_DIR,
    "confusion_matrix.csv",
)

with open(
    confusion_matrix_path,
    "w",
    newline="",
    encoding="utf-8",
) as file:

    writer = csv.writer(file)

    writer.writerow(
        ["Actual \\ Predicted"]
        + class_names
    )

    for i, row in enumerate(cm):

        writer.writerow(
            [class_names[i]]
            + row.tolist()
        )


# =========================================================
# Save Per-Class Metrics
# =========================================================

per_class_path = os.path.join(
    RESULTS_DIR,
    "per_class_metrics.csv",
)

with open(
    per_class_path,
    "w",
    newline="",
    encoding="utf-8",
) as file:

    writer = csv.writer(file)

    writer.writerow(
        [
            "class",
            "precision",
            "recall",
            "f1_score",
            "support",
        ]
    )

    for class_name in class_names:

        metrics = report_dict[
            class_name
        ]

        writer.writerow(
            [
                class_name,
                metrics["precision"],
                metrics["recall"],
                metrics["f1-score"],
                int(metrics["support"]),
            ]
        )


# =========================================================
# Inference Metrics
# =========================================================

total_samples = len(
    all_labels
)

average_inference_ms = (
    total_inference_time
    / total_samples
    * 1000
)

throughput = (
    total_samples
    / total_inference_time
)


# =========================================================
# Final Metrics JSON
# =========================================================

final_metrics = {

    "experiment": {
        "clients": NUM_CLIENTS,
        "rounds": NUM_ROUNDS,
        "local_epochs": LOCAL_EPOCHS,
        "batch_size": BATCH_SIZE,
        "learning_rate": LEARNING_RATE,
        "features": INPUT_SIZE,
        "classes": NUM_CLASSES,
        "training_samples": 1999827,
        "test_samples": total_samples,
        "model": MODEL_PATH,
    },

    "final_metrics": {
        "accuracy": float(
            accuracy
        ),
        "weighted_precision": float(
            weighted_precision
        ),
        "weighted_recall": float(
            weighted_recall
        ),
        "weighted_f1": float(
            weighted_f1
        ),
        "macro_precision": float(
            macro_precision
        ),
        "macro_recall": float(
            macro_recall
        ),
        "macro_f1": float(
            macro_f1
        ),
    },

    "inference": {
        "total_inference_seconds": float(
            total_inference_time
        ),
        "average_inference_ms": float(
            average_inference_ms
        ),
        "samples_per_second": float(
            throughput
        ),
    },

    "model": {
        "input_features": INPUT_SIZE,
        "hidden_layer_1": 256,
        "hidden_layer_2": 128,
        "dropout": 0.3,
        "parameters": sum(
            p.numel()
            for p in model.parameters()
        ),
    },

    "classes": class_names,
}


final_metrics_path = os.path.join(
    RESULTS_DIR,
    "final_metrics.json",
)

with open(
    final_metrics_path,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        final_metrics,
        file,
        indent=4,
    )


# =========================================================
# Copy Federated Convergence Results
# =========================================================

existing_convergence = (
    "results/federated_round_metrics.csv"
)

convergence_path = os.path.join(
    RESULTS_DIR,
    "convergence.csv",
)

if os.path.exists(
    existing_convergence
):

    import shutil

    shutil.copyfile(
        existing_convergence,
        convergence_path,
    )

else:

    print(
        "\nWARNING: "
        "federated_round_metrics.csv not found."
    )


# =========================================================
# Generate Convergence Plot
# =========================================================

if os.path.exists(
    convergence_path
):

    import pandas as pd

    convergence = pd.read_csv(
        convergence_path
    )

    plt.figure(
        figsize=(10, 6)
    )

    if "round" in convergence.columns:

        if "accuracy" in convergence.columns:

            plt.plot(
                convergence["round"],
                convergence["accuracy"] * 100,
                marker="o",
                label="Accuracy (%)",
            )

        if "f1" in convergence.columns:

            plt.plot(
                convergence["round"],
                convergence["f1"] * 100,
                marker="o",
                label="Weighted F1 (%)",
            )

        if "loss" in convergence.columns:

            ax = plt.gca()

            ax2 = ax.twinx()

            ax2.plot(
                convergence["round"],
                convergence["loss"],
                marker="s",
                linestyle="--",
                label="Loss",
            )

            ax2.set_ylabel(
                "Loss"
            )

            ax2.legend(
                loc="lower right"
            )

        plt.xlabel(
            "Federated Round"
        )

        plt.ylabel(
            "Performance (%)"
        )

        plt.title(
            "Federated Learning Convergence"
        )

        plt.grid(
            True,
            alpha=0.3,
        )

        plt.legend(
            loc="best"
        )

        plt.tight_layout()

        plt.savefig(
            os.path.join(
                RESULTS_DIR,
                "convergence.png",
            ),
            dpi=300,
            bbox_inches="tight",
        )

        plt.close()


# =========================================================
# Print Final Results
# =========================================================

print("\n" + "=" * 70)
print("FINAL IEEE EVALUATION COMPLETED")
print("=" * 70)

print(
    f"Accuracy           : "
    f"{accuracy * 100:.4f}%"
)

print(
    f"Weighted Precision : "
    f"{weighted_precision * 100:.4f}%"
)

print(
    f"Weighted Recall    : "
    f"{weighted_recall * 100:.4f}%"
)

print(
    f"Weighted F1        : "
    f"{weighted_f1 * 100:.4f}%"
)

print(
    f"Macro Precision    : "
    f"{macro_precision * 100:.4f}%"
)

print(
    f"Macro Recall       : "
    f"{macro_recall * 100:.4f}%"
)

print(
    f"Macro F1           : "
    f"{macro_f1 * 100:.4f}%"
)

print(
    f"\nInference Time    : "
    f"{total_inference_time:.4f} seconds"
)

print(
    f"Average Inference : "
    f"{average_inference_ms:.6f} ms/sample"
)

print(
    f"Throughput        : "
    f"{throughput:.2f} samples/sec"
)

print("\nGenerated files:")

for filename in [
    "final_metrics.json",
    "classification_report.txt",
    "confusion_matrix.csv",
    "per_class_metrics.csv",
    "convergence.csv",
    "convergence.png",
]:

    path = os.path.join(
        RESULTS_DIR,
        filename,
    )

    print(
        f"  {path}"
    )

print("=" * 70)