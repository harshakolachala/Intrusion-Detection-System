"""
Centralized Baseline Experiment for IEEE Evaluation.

Uses the SAME:
    - cleaned dataset
    - 80/20 stratified split
    - StandardScaler
    - 78 features
    - 15 classes
    - MLP architecture
    - batch size
    - learning rate
    - 5 training epochs

as the federated experiment.

This experiment is independent of Flower.

Outputs:
    results/centralized_metrics.json
    results/centralized_classification_report.txt
    results/centralized_per_class_metrics.csv
    results/centralized_confusion_matrix.csv
    results/centralized_training_history.csv
    results/centralized_training_history.png
    results/federated_vs_centralized.csv
"""

import csv
import json
import os
import time

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from torch.utils.data import DataLoader

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
    LEARNING_RATE,
    LOCAL_EPOCHS,
)

from federated.dataset import IDSDataset
from federated.model import MLPIDS


# =========================================================
# Configuration
# =========================================================

RESULTS_DIR = "results"

os.makedirs(
    RESULTS_DIR,
    exist_ok=True,
)

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

CENTRALIZED_MODEL_PATH = (
    "models/centralized_model.pth"
)

LABEL_MAPPING_PATH = (
    "federated/label_mapping.json"
)


# =========================================================
# Load Labels
# =========================================================

with open(
    LABEL_MAPPING_PATH,
    "r",
    encoding="utf-8",
) as file:

    label_mapping = json.load(file)


class_names = [
    label_mapping[str(i)]
    for i in range(NUM_CLASSES)
]


# =========================================================
# Header
# =========================================================

print("=" * 70)
print("CENTRALIZED MLP BASELINE")
print("=" * 70)

print(
    f"Device       : {DEVICE}"
)

print(
    f"Features     : {INPUT_SIZE}"
)

print(
    f"Classes      : {NUM_CLASSES}"
)

print(
    f"Batch Size   : {BATCH_SIZE}"
)

print(
    f"Epochs       : {LOCAL_EPOCHS}"
)

print(
    f"Learning Rate: {LEARNING_RATE}"
)


# =========================================================
# Load Dataset
# =========================================================

print("\nLoading complete dataset...")

dataset = IDSDataset(
    development=False,
    num_clients=3,
    batch_size=BATCH_SIZE,
)

(
    X_train,
    X_test,
    y_train,
    y_test,
) = dataset.preprocess()

print(
    f"\nTraining samples : {len(X_train):,}"
)

print(
    f"Testing samples  : {len(X_test):,}"
)


# =========================================================
# Convert to Tensor
# =========================================================

X_train = torch.tensor(
    X_train,
    dtype=torch.float32,
)

y_train = torch.tensor(
    y_train,
    dtype=torch.long,
)

X_test = torch.tensor(
    X_test,
    dtype=torch.float32,
)

y_test = torch.tensor(
    y_test,
    dtype=torch.long,
)


# =========================================================
# DataLoaders
# =========================================================

train_dataset = torch.utils.data.TensorDataset(
    X_train,
    y_train,
)

test_dataset = torch.utils.data.TensorDataset(
    X_test,
    y_test,
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
)


# =========================================================
# Model
# =========================================================

model = MLPIDS(
    input_size=INPUT_SIZE,
    num_classes=NUM_CLASSES,
)

model.to(DEVICE)

print(
    f"\nModel parameters : "
    f"{sum(p.numel() for p in model.parameters()):,}"
)


# =========================================================
# Class Weights
# =========================================================

print("\nCalculating class weights...")

class_counts = np.bincount(
    y_train.numpy(),
    minlength=NUM_CLASSES,
)

total_samples = class_counts.sum()

class_weights = np.ones(
    NUM_CLASSES,
    dtype=np.float32,
)

for class_id in range(NUM_CLASSES):

    if class_counts[class_id] > 0:

        class_weights[class_id] = (
            total_samples
            / (
                NUM_CLASSES
                * class_counts[class_id]
            )
        )

weights = torch.tensor(
    class_weights,
    dtype=torch.float32,
    device=DEVICE,
)

print("\nClass Distribution")

for class_id in range(NUM_CLASSES):

    print(
        f"{class_id:2d} | "
        f"{class_names[class_id]:30s} | "
        f"{class_counts[class_id]:8d} | "
        f"weight={class_weights[class_id]:.6f}"
    )


# =========================================================
# Loss and Optimizer
# =========================================================

criterion = nn.CrossEntropyLoss(
    weight=weights
)

optimizer = optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE,
)


# =========================================================
# Training
# =========================================================

history = []

print("\n" + "=" * 70)
print("STARTING CENTRALIZED TRAINING")
print("=" * 70)

training_start = time.perf_counter()

for epoch in range(LOCAL_EPOCHS):

    model.train()

    epoch_loss = 0.0
    correct = 0
    total = 0

    epoch_start = time.perf_counter()

    for features, labels in train_loader:

        features = features.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(
            features
        )

        loss = criterion(
            outputs,
            labels,
        )

        loss.backward()

        optimizer.step()

        epoch_loss += loss.item()

        predictions = torch.argmax(
            outputs,
            dim=1,
        )

        total += labels.size(0)

        correct += (
            predictions == labels
        ).sum().item()

    epoch_time = (
        time.perf_counter()
        - epoch_start
    )

    average_loss = (
        epoch_loss
        / len(train_loader)
    )

    accuracy = (
        correct / total
    )

    history.append(
        {
            "epoch": epoch + 1,
            "loss": average_loss,
            "accuracy": accuracy,
            "time_seconds": epoch_time,
        }
    )

    print(
        f"Epoch [{epoch + 1}/{LOCAL_EPOCHS}] "
        f"| Loss: {average_loss:.6f} "
        f"| Accuracy: {accuracy * 100:.4f}% "
        f"| Time: {epoch_time:.2f}s"
    )


total_training_time = (
    time.perf_counter()
    - training_start
)


# =========================================================
# Save Model
# =========================================================

os.makedirs(
    "models",
    exist_ok=True,
)

torch.save(
    model.state_dict(),
    CENTRALIZED_MODEL_PATH,
)

print(
    f"\nCentralized model saved: "
    f"{CENTRALIZED_MODEL_PATH}"
)


# =========================================================
# Final Evaluation
# =========================================================

print("\n" + "=" * 70)
print("FINAL CENTRALIZED EVALUATION")
print("=" * 70)

model.eval()

all_labels = []
all_predictions = []

inference_start = time.perf_counter()

with torch.no_grad():

    for features, labels in test_loader:

        features = features.to(DEVICE)

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

inference_time = (
    time.perf_counter()
    - inference_start
)

all_labels = np.asarray(
    all_labels
)

all_predictions = np.asarray(
    all_predictions
)


# =========================================================
# Metrics
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

with open(
    "results/centralized_classification_report.txt",
    "w",
    encoding="utf-8",
) as file:

    file.write(
        "Centralized MLP IDS Baseline\n"
    )

    file.write(
        "=" * 70 + "\n\n"
    )

    file.write(
        report_text
    )


# =========================================================
# Save Per-Class Metrics
# =========================================================

with open(
    "results/centralized_per_class_metrics.csv",
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
# Save Confusion Matrix
# =========================================================

with open(
    "results/centralized_confusion_matrix.csv",
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
# Save Training History
# =========================================================

with open(
    "results/centralized_training_history.csv",
    "w",
    newline="",
    encoding="utf-8",
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=[
            "epoch",
            "loss",
            "accuracy",
            "time_seconds",
        ],
    )

    writer.writeheader()

    writer.writerows(
        history
    )


# =========================================================
# Training Plot
# =========================================================

epochs = [
    item["epoch"]
    for item in history
]

losses = [
    item["loss"]
    for item in history
]

accuracies = [
    item["accuracy"] * 100
    for item in history
]

plt.figure(
    figsize=(10, 6)
)

plt.plot(
    epochs,
    accuracies,
    marker="o",
    label="Training Accuracy (%)",
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Accuracy (%)"
)

plt.title(
    "Centralized MLP Training Accuracy"
)

plt.grid(
    True,
    alpha=0.3,
)

plt.legend()

plt.tight_layout()

plt.savefig(
    "results/centralized_training_history.png",
    dpi=300,
    bbox_inches="tight",
)

plt.close()


# =========================================================
# Save Centralized Metrics
# =========================================================

centralized_metrics = {

    "experiment": {
        "type": "centralized",
        "features": INPUT_SIZE,
        "classes": NUM_CLASSES,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "epochs": LOCAL_EPOCHS,
        "batch_size": BATCH_SIZE,
        "learning_rate": LEARNING_RATE,
        "device": str(DEVICE),
    },

    "metrics": {
        "accuracy": float(accuracy),
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

    "training": {
        "total_seconds": float(
            total_training_time
        ),
    },

    "inference": {
        "total_seconds": float(
            inference_time
        ),
        "samples_per_second": float(
            len(X_test)
            / inference_time
        ),
    },

    "model": {
        "parameters": sum(
            p.numel()
            for p in model.parameters()
        ),
        "hidden1": 256,
        "hidden2": 128,
        "dropout": 0.3,
    },

    "classes": class_names,
}


with open(
    "results/centralized_metrics.json",
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        centralized_metrics,
        file,
        indent=4,
    )


# =========================================================
# Federated vs Centralized Comparison
# =========================================================

federated_metrics_path = (
    "results/final_metrics.json"
)

if os.path.exists(
    federated_metrics_path
):

    with open(
        federated_metrics_path,
        "r",
        encoding="utf-8",
    ) as file:

        federated = json.load(file)

    fed = federated[
        "final_metrics"
    ]

    comparison = [
        [
            "Federated",
            fed["accuracy"],
            fed["weighted_precision"],
            fed["weighted_recall"],
            fed["weighted_f1"],
            fed["macro_precision"],
            fed["macro_recall"],
            fed["macro_f1"],
        ],
        [
            "Centralized",
            accuracy,
            weighted_precision,
            weighted_recall,
            weighted_f1,
            macro_precision,
            macro_recall,
            macro_f1,
        ],
    ]

    with open(
        "results/federated_vs_centralized.csv",
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.writer(file)

        writer.writerow(
            [
                "model",
                "accuracy",
                "weighted_precision",
                "weighted_recall",
                "weighted_f1",
                "macro_precision",
                "macro_recall",
                "macro_f1",
            ]
        )

        writer.writerows(
            comparison
        )


# =========================================================
# Final Output
# =========================================================

print("\n" + "=" * 70)
print("CENTRALIZED BASELINE COMPLETED")
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
    f"\nTraining Time      : "
    f"{total_training_time:.2f} seconds"
)

print(
    f"Test Samples       : "
    f"{len(X_test):,}"
)

print("\nResults saved under:")
print("results/")

print("=" * 70)