"""
Flower federated learning client.
Each client loads its own local shard (client{N}_X.npy / client{N}_y.npy)
and trains locally, sharing only model weights with the server — never raw data.

Run one of these per simulated client, e.g.:
    python fl_client.py 0
    python fl_client.py 1
    python fl_client.py 2
"""

import sys
import numpy as np
import torch
import torch.nn as nn
import flwr as fl
from sklearn.model_selection import train_test_split
from model import IDS_MLP

if len(sys.argv) < 2:
    print("Usage: python fl_client.py <client_id>")
    sys.exit(1)

CLIENT_ID = sys.argv[1]
DATA_DIR = "data/clients"
LOCAL_EPOCHS = 2  # per federated round, keep small — this runs every round
LEARNING_RATE = 0.001

print(f"[Client {CLIENT_ID}] Loading local data...")
X = np.load(f"{DATA_DIR}/client{CLIENT_ID}_X.npy")
y = np.load(f"{DATA_DIR}/client{CLIENT_ID}_y.npy")

# Keep a local holdout for this client's own evaluation
X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.1, random_state=42, stratify=y
)

X_train_t = torch.tensor(X_train, dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.long)
X_val_t = torch.tensor(X_val, dtype=torch.float32)
y_val_t = torch.tensor(y_val, dtype=torch.long)

NUM_CLASSES = 15  # fixed, matches preprocessing output across all clients
model = IDS_MLP(input_dim=X.shape[1], num_classes=NUM_CLASSES)
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
criterion = nn.CrossEntropyLoss()

train_dataset = torch.utils.data.TensorDataset(X_train_t, y_train_t)
train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=512, shuffle=True)

print(f"[Client {CLIENT_ID}] Ready. Train: {len(X_train)}, Val: {len(X_val)}")


class IDSClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        return [val.cpu().numpy() for val in model.state_dict().values()]

    def set_parameters(self, parameters):
        params_dict = zip(model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        model.train()
        for epoch in range(LOCAL_EPOCHS):
            for X_batch, y_batch in train_loader:
                optimizer.zero_grad()
                out = model(X_batch)
                loss = criterion(out, y_batch)
                loss.backward()
                optimizer.step()
        print(f"[Client {CLIENT_ID}] Completed local training round.")
        return self.get_parameters(config={}), len(X_train_t), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        model.eval()
        with torch.no_grad():
            out = model(X_val_t)
            loss = criterion(out, y_val_t).item()
            acc = (out.argmax(dim=1) == y_val_t).float().mean().item()
        print(f"[Client {CLIENT_ID}] Local eval - loss: {loss:.4f}, acc: {acc:.4f}")
        return loss, len(X_val_t), {"accuracy": acc}


if __name__ == "__main__":
    fl.client.start_client(
        server_address="127.0.0.1:8081",
        client=IDSClient().to_client(),
    )