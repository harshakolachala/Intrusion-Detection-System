"""
Preprocessor for SentinelAI.

Handles missing values and converts feature vectors
to the tensor format expected by the ML model.
"""

from typing import List

import torch
import numpy as np

from federated.config import INPUT_SIZE


class Preprocessor:
    """
    Preprocesses raw feature vectors before model inference.
    """

    @staticmethod
    def handle_missing_values(features: List[float]) -> List[float]:
        """Replace NaN/Inf with 0.0."""
        result = []
        for f in features:
            if f is None or np.isnan(f) or np.isinf(f):
                result.append(0.0)
            else:
                result.append(float(f))
        return result

    @staticmethod
    def validate(features: List[float]) -> List[float]:
        """Ensure exactly 78 features."""
        features = Preprocessor.handle_missing_values(features)

        if len(features) != INPUT_SIZE:
            raise ValueError(
                f"Expected {INPUT_SIZE} features, got {len(features)}"
            )

        return features

    @staticmethod
    def to_tensor(features: List[float]) -> torch.Tensor:
        """Convert feature list to a torch tensor for model input."""
        features = Preprocessor.validate(features)
        return torch.tensor(
            [features],
            dtype=torch.float32
        )


preprocessor = Preprocessor()
