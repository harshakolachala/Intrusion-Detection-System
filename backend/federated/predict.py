import json
import joblib
import numpy as np
import pandas as pd
import torch

from federated.model import load_model
from federated.config import (
    MODEL_PATH,
    INPUT_SIZE,
    NUM_CLASSES,
    LABEL_MAPPING_PATH,
    SCALER_PATH,
)


class Predictor:
    """
    Production inference wrapper for the federated IDS model.

    Pipeline:
        78 raw CICIDS features
            ↓
        DataFrame with training feature names
            ↓
        StandardScaler
            ↓
        PyTorch global model
            ↓
        Softmax
            ↓
        15-class prediction
    """

    def __init__(self):

        print("Loading Global Model...")

        self.model = load_model(
            MODEL_PATH,
            input_size=INPUT_SIZE,
            num_classes=NUM_CLASSES,
        )

        print("Loading Scaler...")

        self.scaler = joblib.load(
            SCALER_PATH
        )

        print("Loading Label Mapping...")

        with open(
            LABEL_MAPPING_PATH,
            "r",
            encoding="utf-8",
        ) as f:
            self.class_names = json.load(f)

        # ---------------------------------------------------
        # Validate model artifacts
        # ---------------------------------------------------

        if len(self.class_names) != NUM_CLASSES:
            raise ValueError(
                f"Expected {NUM_CLASSES} classes, "
                f"but label mapping contains "
                f"{len(self.class_names)}."
            )

        # ---------------------------------------------------
        # Recover feature names from the fitted scaler
        # ---------------------------------------------------

        self.feature_names = getattr(
            self.scaler,
            "feature_names_in_",
            None,
        )

        if self.feature_names is None:
            raise ValueError(
                "Scaler does not contain feature names. "
                "The scaler must be fitted using a pandas "
                "DataFrame containing the 78 CICIDS feature names."
            )

        if len(self.feature_names) != INPUT_SIZE:
            raise ValueError(
                f"Scaler expects {len(self.feature_names)} features, "
                f"but INPUT_SIZE is {INPUT_SIZE}."
            )

        print(
            f"Scaler Feature Count : "
            f"{len(self.feature_names)}"
        )

        print("Model Loaded Successfully!")

    def predict(self, features):

        # ---------------------------------------------------
        # Validate feature count
        # ---------------------------------------------------

        if len(features) != INPUT_SIZE:
            raise ValueError(
                f"Expected {INPUT_SIZE} features, "
                f"received {len(features)}."
            )

        # ---------------------------------------------------
        # Convert input to DataFrame
        #
        # This preserves the feature names expected by
        # StandardScaler and eliminates the sklearn warning.
        # ---------------------------------------------------

        feature_array = np.asarray(
            features,
            dtype=np.float32,
        ).reshape(1, -1)

        feature_df = pd.DataFrame(
            feature_array,
            columns=self.feature_names,
        )

        # ---------------------------------------------------
        # Scale using the training scaler
        # ---------------------------------------------------

        scaled_features = self.scaler.transform(
            feature_df
        )

        # ---------------------------------------------------
        # Convert to PyTorch tensor
        # ---------------------------------------------------

        x = torch.tensor(
            scaled_features,
            dtype=torch.float32,
        )

        # ---------------------------------------------------
        # Model inference
        # ---------------------------------------------------

        self.model.eval()

        with torch.no_grad():

            outputs = self.model(x)

            probabilities = torch.softmax(
                outputs,
                dim=1,
            )

            confidence, prediction = torch.max(
                probabilities,
                dim=1,
            )

        class_index = prediction.item()

        predicted_class = self.class_names[
            str(class_index)
        ]

        return {
            "prediction": predicted_class,
            "confidence": round(
                confidence.item(),
                4,
            ),
        }


if __name__ == "__main__":

    print("=" * 60)
    print("SentinelAI Prediction Smoke Test")
    print("=" * 60)

    predictor = Predictor()

    sample = [0.0] * INPUT_SIZE

    result = predictor.predict(sample)

    print("\nPrediction Result")
    print("-" * 60)
    print(f"Prediction : {result['prediction']}")
    print(f"Confidence : {result['confidence']}")