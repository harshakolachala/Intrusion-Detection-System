import os
import joblib
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
from federated.model import save_model


def calculate_class_weights(
    train_loader,
    num_classes,
    device,
):
    """
    Calculate balanced class weights from the
    training data.

    Rare classes receive higher weights.
    """

    class_counts = torch.zeros(
        num_classes,
        dtype=torch.float64,
    )

    for _, labels in train_loader:

        counts = torch.bincount(
            labels,
            minlength=num_classes,
        )

        class_counts += counts.double()

    total_samples = class_counts.sum()

    # Balanced weighting:
    #
    # weight_i = total_samples /
    #           (num_classes * class_count_i)

    class_weights = torch.zeros_like(
        class_counts
    )

    for i in range(num_classes):

        if class_counts[i] > 0:

            class_weights[i] = (
                total_samples
                / (
                    num_classes
                    * class_counts[i]
                )
            )

    # Normalize weights around 1
    non_zero = class_weights > 0

    mean_weight = class_weights[
        non_zero
    ].mean()

    class_weights[
        non_zero
    ] = (
        class_weights[
            non_zero
        ] / mean_weight
    )

    class_weights = class_weights.float()

    print("\nClass Distribution / Weights")
    print("-" * 60)

    for i in range(num_classes):

        print(
            f"Class {i:2d} | "
            f"Samples: {int(class_counts[i]):8d} | "
            f"Weight: {class_weights[i]:.4f}"
        )

    print("-" * 60)

    return class_weights.to(device)


def train_local_model(
    model,
    train_loader,
    epochs=LOCAL_EPOCHS,
    learning_rate=LEARNING_RATE,
    device=None,
):
    """
    Train the model locally using
    class-weighted CrossEntropyLoss.
    """

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
    # Calculate class weights
    # ---------------------------------------------------

    class_weights = calculate_class_weights(
        train_loader=train_loader,
        num_classes=NUM_CLASSES,
        device=device,
    )

    # ---------------------------------------------------
    # Weighted Loss
    # ---------------------------------------------------

    criterion = nn.CrossEntropyLoss(
        weight=class_weights
    )

    optimizer = optim.Adam(
        model.parameters(),
        lr=learning_rate,
    )

    model.train()

    # ---------------------------------------------------
    # Training
    # ---------------------------------------------------

    for epoch in range(epochs):

        total_loss = 0.0
        correct = 0
        total = 0

        for features, labels in train_loader:

            features = features.to(device)

            labels = labels.to(device)

            optimizer.zero_grad()

            outputs = model(features)

            loss = criterion(
                outputs,
                labels,
            )

            loss.backward()

            optimizer.step()

            total_loss += loss.item()

            _, predicted = torch.max(
                outputs,
                dim=1,
            )

            total += labels.size(0)

            correct += (
                predicted == labels
            ).sum().item()

        avg_loss = (
            total_loss
            / len(train_loader)
        )

        accuracy = (
            100.0
            * correct
            / total
        )

        print(
            f"Epoch [{epoch + 1}/{epochs}] | "
            f"Loss: {avg_loss:.4f} | "
            f"Accuracy: {accuracy:.2f}%"
        )

    return model


if __name__ == "__main__":

    print("=" * 60)
    print("SentinelAI Class-Weighted Training")
    print("=" * 60)

    # ---------------------------------------------------
    # Full Dataset
    # ---------------------------------------------------

    dataset = IDSDataset(
        development=False,
        num_clients=3,
    )

    (
        client_loaders,
        test_loader,
    ) = dataset.create_clients()

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

    print(
        "\nStarting Class-Weighted "
        "Local Training..."
    )

    # ---------------------------------------------------
    # Train Client 0
    #
    # This is still a baseline experiment.
    # Federated training comes next.
    # ---------------------------------------------------

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

    print(
        "\nSaving Files..."
    )

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
        "\nClass-Weighted Training "
        "Completed Successfully!"
    )

    print("=" * 60)