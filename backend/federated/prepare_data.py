"""
One-time preparation of the full federated IDS dataset.

This script:
1. Loads and cleans the complete dataset.
2. Creates the stratified 80/20 train/test split.
3. Fits StandardScaler on training data only.
4. Shuffles the training data using the existing random seed.
5. Partitions the training data into 3 federated clients.
6. Saves each client partition to disk.
7. Saves the common test set.
8. Saves scaler and label mapping artifacts.

The saved partitions allow each Flower client to load only
its own data instead of preprocessing the 2.5M-row CSV.
"""

import os
import json
import joblib
import numpy as np
import torch

from federated.dataset import IDSDataset
from federated.config import (
    NUM_CLIENTS,
    BATCH_SIZE,
    DATASET_PATH,
    SCALER_PATH,
    LABEL_MAPPING_PATH,
)


PREPARED_DIR = "federated/prepared_data"


def main():

    print("=" * 70)
    print("FEDERATED DATA PREPARATION")
    print("=" * 70)

    os.makedirs(PREPARED_DIR, exist_ok=True)

    # -------------------------------------------------------
    # Load and preprocess complete dataset
    # -------------------------------------------------------

    dataset = IDSDataset(
        csv_path=DATASET_PATH,
        num_clients=NUM_CLIENTS,
        development=False,
        batch_size=BATCH_SIZE,
    )

    (
        X_train,
        X_test,
        y_train,
        y_test,
    ) = dataset.preprocess()

    print("\nPreprocessing completed.")

    print(
        f"Training samples : {len(X_train):,}"
    )

    print(
        f"Testing samples  : {len(X_test):,}"
    )

    print(
        f"Features         : {X_train.shape[1]}"
    )

    # -------------------------------------------------------
    # Shuffle training data
    #
    # This matches the existing create_clients()
    # implementation.
    # -------------------------------------------------------

    rng = np.random.default_rng(
        dataset.random_state
    )

    indices = rng.permutation(
        len(X_train)
    )

    X_train = X_train[indices]
    y_train = y_train[indices]

    # -------------------------------------------------------
    # Partition training data
    # -------------------------------------------------------

    client_indices = np.array_split(
        np.arange(len(X_train)),
        NUM_CLIENTS,
    )

    print("\nCreating client partitions...")
    print("-" * 70)

    for client_id, indices in enumerate(
        client_indices
    ):

        X_client = X_train[indices]
        y_client = y_train[indices]

        client_path = os.path.join(
            PREPARED_DIR,
            f"client_{client_id}.pt",
        )

        client_data = {
            "features": torch.tensor(
                X_client,
                dtype=torch.float32,
            ),
            "labels": torch.tensor(
                y_client,
                dtype=torch.long,
            ),
        }

        torch.save(
            client_data,
            client_path,
        )

        print(
            f"Client {client_id} : "
            f"{len(X_client):,} samples"
        )

    # -------------------------------------------------------
    # Save test dataset
    # -------------------------------------------------------

    test_path = os.path.join(
        PREPARED_DIR,
        "test.pt",
    )

    test_data = {
        "features": torch.tensor(
            X_test,
            dtype=torch.float32,
        ),
        "labels": torch.tensor(
            y_test,
            dtype=torch.long,
        ),
    }

    torch.save(
        test_data,
        test_path,
    )

    print(
        f"Test set        : "
        f"{len(X_test):,} samples"
    )

    # -------------------------------------------------------
    # Save scaler
    # -------------------------------------------------------

    joblib.dump(
        dataset.scaler,
        SCALER_PATH,
    )

    print(
        f"\nScaler saved    : {SCALER_PATH}"
    )

    # -------------------------------------------------------
    # Save label mapping
    # -------------------------------------------------------

    with open(
        LABEL_MAPPING_PATH,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            dataset.label_mapping,
            file,
            indent=4,
        )

    print(
        f"Label mapping   : "
        f"{LABEL_MAPPING_PATH}"
    )

    # -------------------------------------------------------
    # Save preparation metadata
    # -------------------------------------------------------

    metadata = {
        "dataset": DATASET_PATH,
        "num_clients": NUM_CLIENTS,
        "batch_size": BATCH_SIZE,
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "features": int(X_train.shape[1]),
        "num_classes": 15,
        "test_size": 0.2,
        "random_state": 42,
        "scaler": "StandardScaler",
        "scaler_fit": "training_data_only",
        "partitioning": "equal_after_global_shuffle",
    }

    metadata_path = os.path.join(
        PREPARED_DIR,
        "metadata.json",
    )

    with open(
        metadata_path,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            metadata,
            file,
            indent=4,
        )

    print(
        f"Metadata saved  : {metadata_path}"
    )

    print("\n" + "=" * 70)
    print("FEDERATED DATA PREPARATION COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()