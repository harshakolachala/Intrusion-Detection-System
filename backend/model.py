"""
MLP model for intrusion detection.
Input: 78 features (from preprocess.py output)
Output: 15 classes (attack types + BENIGN)
"""

import torch
import torch.nn as nn


class IDS_MLP(nn.Module):
    def __init__(self, input_dim=78, num_classes=15):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        return self.net(x)