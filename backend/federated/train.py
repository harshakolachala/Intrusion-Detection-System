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
from federated.model import (
    MLPIDS,
    save_model,
)


def train_local_model(
    model,
    train_loader,
    epochs=LOCAL_EPOCHS,
    learning_rate=LEARNING_RATE,
    device=None,
):
    """
    Train the model locally.
    """

    if device is None:
        device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    print(f"\nUsing Device : {device}")

    model.to(device)

    criterion = nn.CrossEntropyLoss()

    optimizer = optim.Adam(
        model.parameters(),
        lr=learning_rate,
    )

    model.train()

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

        avg_loss = total_loss / len(train_loader)

        accuracy = 100 * correct / total

        print(
            f"Epoch [{epoch + 1}/{epochs}] | "
            f"Loss: {avg_loss:.4f} | "
            f"Accuracy: {accuracy:.2f}%"
        )

    return model


if __name__ == "__main__":

    print("=" * 60)
    print("SentinelAI Federated Training")
    print("=" * 60)

    dataset = IDSDataset(
        development=False,
    )

    client_loaders, test_loader = dataset.create_clients()

    print("\nDataset Loaded Successfully")
    print(f"Number of Clients : {len(client_loaders)}")

    model = MLPIDS(
        input_size=INPUT_SIZE,
        num_classes=NUM_CLASSES,
    )

    print("\nStarting Local Training...\n")

    model = train_local_model(
        model=model,
        train_loader=client_loaders[0],
        epochs=LOCAL_EPOCHS,
    )

    os.makedirs("models", exist_ok=True)

    save_model(
        model,
        MODEL_PATH,
    )

    joblib.dump(
        dataset.scaler,
        "federated/scaler.pkl",
    )

    print("\nSaving Files...")

    print(f"Model Saved         : {MODEL_PATH}")
    print("Scaler Saved        : federated/scaler.pkl")
    print("Label Mapping Saved : federated/label_mapping.json")

    print("\nTraining Completed Successfully!")

    print("=" * 60)