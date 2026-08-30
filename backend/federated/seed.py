"""
Reproducibility utilities for SentinelAI experiments.
"""

import os
import random

import numpy as np
import torch


SEED = 42


def set_seed(seed: int = SEED):
    """
    Set random seeds for reproducible experiments.
    """

    os.environ["PYTHONHASHSEED"] = str(seed)

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

    # Ensure deterministic behavior where possible.
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

    print(
        f"Reproducibility seed set to {seed}"
    )