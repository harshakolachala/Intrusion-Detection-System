import json
import joblib
import numpy as np
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

        print("Model Loaded Successfully!")

    def predict(self, features):

        self.model.eval()

        with torch.no_grad():

            features = np.array(
                features,
                dtype=np.float32,
            ).reshape(1, -1)

            features = self.scaler.transform(
                features
            )

            x = torch.tensor(
                features,
                dtype=torch.float32,
            )

            outputs = self.model(x)

            probabilities = torch.softmax(
                outputs,
                dim=1,
            )

            confidence, prediction = torch.max(
                probabilities,
                dim=1,
            )

            predicted_class = self.class_names[
                str(prediction.item())
            ]

            return {
                "prediction": predicted_class,
                "confidence": round(
                    confidence.item(),
                    4,
                ),
            }


if __name__ == "__main__":

    predictor = Predictor()

    sample = [0.0] * INPUT_SIZE

    result = predictor.predict(sample)

    print(result)