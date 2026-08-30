"""
Federated Local Training.

Provides the local training function used by each
Flower client.

The training uses class-weighted CrossEntropyLoss
to handle the severe class imbalance in CICIDS2017.
"""

import os
import joblib

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from federated.config import (
    LEARNING_RATE,
    LOCAL_EPOCHS,
    INPUT_SIZE,
    NUM_CLASSES,
    MODEL_PATH,
)

from federated.dataset import IDSDataset
from federated.model import (
    MLPIDS,
    save_model,
)


# -------------------------------------------------------
# Calculate Class Weights
# -------------------------------------------------------

def calculate_class_weights(
    train_loader,
    num_classes=NUM_CLASSES,
    device=None,
):
    """
    Calculate balanced class weights from the local
    training partition.

    Formula:

        weight_c = N / (C * count_c)

    where:

        N = total training samples
        C = number of classes
        count_c = samples belonging to class c

    Classes that are not present in a local partition
    receive weight 1.0.
    """

    if device is None:
        device = torch.device(
            "cuda" if torch.cuda.is_available()
            else "cpu"
        )

    class_counts = np.zeros(
        num_classes,
        dtype=np.int64,
    )

    # ---------------------------------------------------
    # Count labels in the local dataset
    # ---------------------------------------------------

    for _, labels in train_loader:

        labels = labels.cpu().numpy()

        counts = np.bincount(
            labels,
            minlength=num_classes,
        )

        class_counts += counts

    total_samples = class_counts.sum()

    # ---------------------------------------------------
    # Calculate balanced weights
    # ---------------------------------------------------

    class_weights = np.ones(
        num_classes,
        dtype=np.float32,
    )

    for class_id in range(num_classes):

        if class_counts[class_id] > 0:

            class_weights[class_id] = (
                total_samples
                / (
                    num_classes
                    * class_counts[class_id]
                )
            )

        else:

            # Class does not exist in this client's
            # local partition.
            class_weights[class_id] = 1.0

    print("\nLocal Class Distribution")
    print("-" * 60)

    for class_id in range(num_classes):

        print(
            f"Class {class_id:2d} | "
            f"Samples: {class_counts[class_id]:8d} | "
            f"Weight: {class_weights[class_id]:.4f}"
        )

    print("-" * 60)

    weights = torch.tensor(
        class_weights,
        dtype=torch.float32,
        device=device,
    )

    return weights


# -------------------------------------------------------
# Local Model Training
# -------------------------------------------------------

def train_local_model(
    model,
    train_loader,
    epochs=LOCAL_EPOCHS,
    learning_rate=LEARNING_RATE,
    device=None,
):
    """
    Train a model locally on one federated client.

    Uses class-weighted CrossEntropyLoss to improve
    detection of minority attack classes.
    """

    # ---------------------------------------------------
    # Device
    # ---------------------------------------------------

    if device is None:

        device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

    print(
        f"\nUsing Device : {device}"
    )

    model.to(device)

    # ---------------------------------------------------
    # Class Weights
    # ---------------------------------------------------

    class_weights = calculate_class_weights(
        train_loader=train_loader,
        num_classes=NUM_CLASSES,
        device=device,
    )

    # ---------------------------------------------------
    # Weighted Cross Entropy
    # ---------------------------------------------------

    criterion = nn.CrossEntropyLoss(
        weight=class_weights,
    )

    # ---------------------------------------------------
    # Optimizer
    # ---------------------------------------------------

    optimizer = optim.Adam(
        model.parameters(),
        lr=learning_rate,
    )

    # ---------------------------------------------------
    # Training Mode
    # ---------------------------------------------------

    model.train()

    # ---------------------------------------------------
    # Epoch Loop
    # ---------------------------------------------------

    for epoch in range(epochs):

        total_loss = 0.0
        correct = 0
        total = 0

        # -----------------------------------------------
        # Batch Loop
        # -----------------------------------------------

        for features, labels in train_loader:

            features = features.to(device)
            labels = labels.to(device)

            # Clear gradients
            optimizer.zero_grad()

            # Forward pass
            outputs = model(features)

            # Weighted loss
            loss = criterion(
                outputs,
                labels,
            )

            # Backpropagation
            loss.backward()

            # Update model
            optimizer.step()

            # -------------------------------------------
            # Statistics
            # -------------------------------------------

            total_loss += loss.item()

            _, predicted = torch.max(
                outputs,
                dim=1,
            )

            total += labels.size(0)

            correct += (
                predicted == labels
            ).sum().item()

        # -----------------------------------------------
        # Epoch Metrics
        # -----------------------------------------------

        if len(train_loader) > 0:

            avg_loss = (
                total_loss
                / len(train_loader)
            )

        else:

            avg_loss = 0.0

        if total > 0:

            accuracy = (
                100.0
                * correct
                / total
            )

        else:

            accuracy = 0.0

        print(
            f"Epoch [{epoch + 1}/{epochs}] | "
            f"Loss: {avg_loss:.4f} | "
            f"Accuracy: {accuracy:.2f}%"
        )

    return model


# -------------------------------------------------------
# Standalone Training
# -------------------------------------------------------
#
# This section is useful for generating the centralized
# class-weighted baseline.
#
# It is NOT the Flower federated training process.
#
# The actual federated experiment is started through:
#
#     federated.server
#     federated.client
#
# -------------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)
    print("SentinelAI Class-Weighted Training")
    print("=" * 60)

    # ---------------------------------------------------
    # Dataset
    # ---------------------------------------------------

    dataset = IDSDataset(
        development=False,
    )

    client_loaders, test_loader = (
        dataset.create_clients()
    )

    print(
        "\nDataset Loaded Successfully"
    )

    print(
        f"Number of Clients : "
        f"{len(client_loaders)}"
    )

    # ---------------------------------------------------
    # Model
    # ---------------------------------------------------

    model = MLPIDS(
        input_size=INPUT_SIZE,
        num_classes=NUM_CLASSES,
    )

    # ---------------------------------------------------
    # Train on Client 0
    # ---------------------------------------------------

    print(
        "\nStarting Class-Weighted "
        "Local Training...\n"
    )

    model = train_local_model(
        model=model,
        train_loader=client_loaders[0],
        epochs=LOCAL_EPOCHS,
    )

    # ---------------------------------------------------
    # Save Model
    # ---------------------------------------------------

    os.makedirs(
        "models",
        exist_ok=True,
    )

    save_model(
        model,
        MODEL_PATH,
    )

    # ---------------------------------------------------
    # Save Scaler
    # ---------------------------------------------------

    joblib.dump(
        dataset.scaler,
        "federated/scaler.pkl",
    )

    # ---------------------------------------------------
    # Files
    # ---------------------------------------------------

    print("\nSaving Files...")

    print(
        f"Model Saved         : "
        f"{MODEL_PATH}"
    )

    print(
        "Scaler Saved        : "
        "federated/scaler.pkl"
    )

    print(
        "Label Mapping Saved : "
        "federated/label_mapping.json"
    )

    print(
        "\nTraining Completed Successfully!"
    )

    print("=" * 60)