import torch

from federated.model import load_model
from federated.config import (
    MODEL_PATH,
    INPUT_SIZE,
    NUM_CLASSES,
)


class Predictor:

    def __init__(self):

        print("Loading Global Model...")

        self.model = load_model(
            MODEL_PATH,
            input_size=INPUT_SIZE,
            num_classes=NUM_CLASSES,
        )

        print("Model Loaded Successfully!")

    def predict(self, features):

        self.model.eval()

        with torch.no_grad():

            x = torch.tensor(
                features,
                dtype=torch.float32
            ).unsqueeze(0)

            outputs = self.model(x)

            probabilities = torch.softmax(
                outputs,
                dim=1
            )

            confidence, prediction = torch.max(
                probabilities,
                dim=1
            )

            result = (
                "Attack"
                if prediction.item() == 1
                else "Normal"
            )

            return {
                "prediction": result,
                "confidence": round(
                    confidence.item(),
                    4
                )
            }


if __name__ == "__main__":

    predictor = Predictor()

    sample = [0.0] * INPUT_SIZE

    result = predictor.predict(sample)

    print(result)