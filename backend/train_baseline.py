"""
Baseline (non-federated) training script.
Trains the MLP on a single client's data (client0) to establish
a "before FL" comparison point. Given severe class imbalance in
the dataset (e.g. Heartbleed: 11 samples vs BENIGN: 2M+), we report
precision/recall/F1 per class rather than relying on raw accuracy alone.
"""

import numpy as np
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from model import IDS_MLP

DATA_DIR = "data/clients"
CLIENT_ID = 0
EPOCHS = 20
BATCH_SIZE = 512
LEARNING_RATE = 0.001


def load_client_data(client_id, data_dir):
    X = np.load(f"{data_dir}/client{client_id}_X.npy")
    y = np.load(f"{data_dir}/client{client_id}_y.npy")
    return X, y


def train():
    print(f"Loading client {CLIENT_ID} data...")
    X, y = load_client_data(CLIENT_ID, DATA_DIR)
    print(f"Data shape: {X.shape}, classes present: {len(np.unique(y))}")

    # 80/20 train/test split, stratified so rare classes appear in both sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    X_train_t = torch.tensor(X_train, dtype=torch.float32)
    y_train_t = torch.tensor(y_train, dtype=torch.long)
    X_test_t = torch.tensor(X_test, dtype=torch.float32)
    y_test_t = torch.tensor(y_test, dtype=torch.long)

    num_classes = len(np.unique(y))
    model = IDS_MLP(input_dim=X.shape[1], num_classes=num_classes)
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    criterion = nn.CrossEntropyLoss()

    train_dataset = torch.utils.data.TensorDataset(X_train_t, y_train_t)
    train_loader = torch.utils.data.DataLoader(
        train_dataset, batch_size=BATCH_SIZE, shuffle=True
    )

    print(f"\nTraining for {EPOCHS} epochs...")
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            out = model(X_batch)
            loss = criterion(out, y_batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch + 1}/{EPOCHS} - avg loss: {avg_loss:.4f}")

    print("\nEvaluating on held-out test set...")
    model.eval()
    with torch.no_grad():
        preds = model(X_test_t).argmax(dim=1).numpy()

    print("\nClassification report (per-class precision/recall/F1):")
    print(classification_report(y_test, preds, zero_division=0))

    overall_acc = (preds == y_test).mean()
    print(f"Overall accuracy: {overall_acc:.4f}")

    torch.save(model.state_dict(), "baseline_model.pt")
    print("\nBaseline model saved to baseline_model.pt")


if __name__ == "__main__":
    train()