import torch
import torch.nn as nn
import torch.optim as optim


def train_local_model(
    model,
    train_loader,
    epochs=10,
    learning_rate=0.001,
    device=None,
):
    """
    Train the model locally on one Flower client.
    """

    if device is None:
        device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    model.to(device)

    criterion = nn.CrossEntropyLoss()

    optimizer = optim.Adam(
        model.parameters(),
        lr=learning_rate
    )

    model.train()

    for epoch in range(epochs):

        total_loss = 0
        correct = 0
        total = 0

        for features, labels in train_loader:

            features = features.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            outputs = model(features)

            loss = criterion(outputs, labels)

            loss.backward()

            optimizer.step()

            total_loss += loss.item()

            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)

            correct += (predicted == labels).sum().item()

        avg_loss = total_loss / len(train_loader)
        accuracy = 100 * correct / total

        print(
            f"Epoch [{epoch+1}/{epochs}] "
            f"Loss: {avg_loss:.4f} "
            f"Accuracy: {accuracy:.2f}%"
        )

    return model