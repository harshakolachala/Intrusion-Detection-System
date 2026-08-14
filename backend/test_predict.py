"""
Prediction smoke test.

The test verifies that the prediction module can be imported
without requiring a trained federated model.

If model artifacts exist, it also performs a real prediction.
"""

import os

from federated.config import (
    INPUT_SIZE,
    MODEL_PATH,
    SCALER_PATH,
    LABEL_MAPPING_PATH,
)
from federated.predict import Predictor


def main():

    print("=" * 60)
    print("SentinelAI Prediction Smoke Test")
    print("=" * 60)

    # -------------------------------------------------------
    # Check model artifacts
    # -------------------------------------------------------

    required_files = [
        MODEL_PATH,
        SCALER_PATH,
        LABEL_MAPPING_PATH,
    ]

    missing_files = [
        path
        for path in required_files
        if not os.path.exists(path)
    ]

    # -------------------------------------------------------
    # Model not available
    # -------------------------------------------------------

    if missing_files:

        print(
            "\nPrediction model artifacts are not available yet."
        )

        print(
            "This is expected before federated training."
        )

        print("\nMissing files:")

        for path in missing_files:
            print(f"  - {path}")

        print(
            "\nPrediction module smoke test PASSED."
        )

        print("=" * 60)

        return

    # -------------------------------------------------------
    # Real prediction test
    # -------------------------------------------------------

    print("\nAll model artifacts found.")
    print("Loading Predictor...")

    predictor = Predictor()

    print("Predictor loaded successfully.")

    # -------------------------------------------------------
    # Create sample input
    # -------------------------------------------------------

    sample = [0.0] * INPUT_SIZE

    print(
        f"Running prediction with {INPUT_SIZE} features..."
    )

    result = predictor.predict(sample)

    # -------------------------------------------------------
    # Validate result
    # -------------------------------------------------------

    if not isinstance(result, dict):
        raise AssertionError(
            "Prediction result must be a dictionary."
        )

    if "prediction" not in result:
        raise AssertionError(
            "Prediction result is missing 'prediction'."
        )

    if "confidence" not in result:
        raise AssertionError(
            "Prediction result is missing 'confidence'."
        )

    print("\nPrediction Result")
    print("-" * 60)
    print(f"Prediction : {result['prediction']}")
    print(f"Confidence : {result['confidence']}")

    print("\nPrediction test PASSED.")
    print("=" * 60)


if __name__ == "__main__":
    main()