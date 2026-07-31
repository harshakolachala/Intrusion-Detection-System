import torch
import torch.nn as nn


class MLPIDS(nn.Module):
    """
    Multi-Layer Perceptron for Intrusion Detection
    """

    def __init__(
        self,
        input_size: int,
        hidden1: int = 256,
        hidden2: int = 128,
        num_classes: int = 2,
        dropout: float = 0.3,
    ):
        super().__init__()

        self.network = nn.Sequential(

            nn.Linear(input_size, hidden1),
            nn.BatchNorm1d(hidden1),
            nn.ReLU(),
            nn.Dropout(dropout),

            nn.Linear(hidden1, hidden2),
            nn.BatchNorm1d(hidden2),
            nn.ReLU(),
            nn.Dropout(dropout),

            nn.Linear(hidden2, num_classes)
        )

    def forward(self, x):
        return self.network(x)


def save_model(model, path):
    torch.save(model.state_dict(), path)


def load_model(path, input_size, num_classes):
    model = MLPIDS(
        input_size=input_size,
        num_classes=num_classes
    )

    model.load_state_dict(
        torch.load(path, map_location="cpu")
    )

    model.eval()

    return model