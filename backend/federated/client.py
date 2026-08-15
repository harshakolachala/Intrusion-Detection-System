"""
Flower Federated Learning Client.

Each client:
1. Loads only its preprocessed local partition.
2. Receives the global model from the Flower server.
3. Trains locally.
4. Sends updated parameters back to the server.
5. Evaluates the received global model.

The complete dataset is NOT loaded by each client.
Prepared client partitions are stored under:

    federated/prepared_data/

Expected files:

    client_0.pt
    client_1.pt
    client_2.pt
    test.pt
"""

import os
import sys

import flwr as fl
import torch

from torch.utils.data import TensorDataset, DataLoader

from federated.config import (
    SERVER_ADDRESS,
    NUM_CLIENTS,
    BATCH_SIZE,
    INPUT_SIZE,
    NUM_CLASSES,
    LOCAL_EPOCHS,
)

from federated.model import MLPIDS
from federated.train import train_local_model
from federated.evaluate import evaluate_model


# =======================================================
# Configuration
# =======================================================

PREPARED_DATA_DIR = "federated/prepared_data"


# =======================================================
# Startup
# =======================================================

print("=" * 60)
print("Starting Flower Federated Learning Client")
print("=" * 60)


class FlowerClient(fl.client.NumPyClient):
    """
    Flower client for federated intrusion detection.

    Each client loads only its assigned preprocessed
    training partition and shares model parameters
    through the Flower server.
    """

    def __init__(self, client_id=0):

        print(
            f"\nInitializing Client {client_id}"
        )

        # ---------------------------------------------------
        # Validate Client ID
        # ---------------------------------------------------

        if client_id not in range(NUM_CLIENTS):

            raise ValueError(
                f"Invalid client_id: {client_id}. "
                f"Client ID must be between "
                f"0 and {NUM_CLIENTS - 1}."
            )

        self.client_id = client_id

        # ---------------------------------------------------
        # Dataset Paths
        # ---------------------------------------------------

        client_path = os.path.join(
            PREPARED_DATA_DIR,
            f"client_{client_id}.pt",
        )

        test_path = os.path.join(
            PREPARED_DATA_DIR,
            "test.pt",
        )

        # ---------------------------------------------------
        # Verify Prepared Dataset
        # ---------------------------------------------------

        if not os.path.exists(client_path):

            raise FileNotFoundError(
                "\nClient dataset not found:\n"
                f"{client_path}\n\n"
                "Run the federated data preparation "
                "step first:\n"
                "python -m federated.prepare_data"
            )

        if not os.path.exists(test_path):

            raise FileNotFoundError(
                "\nTest dataset not found:\n"
                f"{test_path}\n\n"
                "Run the federated data preparation "
                "step first:\n"
                "python -m federated.prepare_data"
            )

        # ---------------------------------------------------
        # Load Local Client Dataset
        # ---------------------------------------------------

        print(
            f"\nLoading local dataset:"
            f"\n{client_path}"
        )

        client_data = torch.load(
            client_path,
            map_location="cpu",
            weights_only=False,
        )

        # ---------------------------------------------------
        # Load Common Test Dataset
        # ---------------------------------------------------

        print(
            f"Loading test dataset:"
            f"\n{test_path}"
        )

        test_data = torch.load(
            test_path,
            map_location="cpu",
            weights_only=False,
        )

        # ---------------------------------------------------
        # Validate Dataset
        # ---------------------------------------------------

        X_client = client_data["features"]
        y_client = client_data["labels"]

        X_test = test_data["features"]
        y_test = test_data["labels"]

        if X_client.shape[1] != INPUT_SIZE:

            raise ValueError(
                f"Client dataset contains "
                f"{X_client.shape[1]} features. "
                f"Expected {INPUT_SIZE}."
            )

        if X_test.shape[1] != INPUT_SIZE:

            raise ValueError(
                f"Test dataset contains "
                f"{X_test.shape[1]} features. "
                f"Expected {INPUT_SIZE}."
            )

        # ---------------------------------------------------
        # Create TensorDatasets
        # ---------------------------------------------------

        train_dataset = TensorDataset(
            X_client,
            y_client,
        )

        test_dataset = TensorDataset(
            X_test,
            y_test,
        )

        # ---------------------------------------------------
        # Create DataLoaders
        # ---------------------------------------------------

        self.train_loader = DataLoader(
            train_dataset,
            batch_size=BATCH_SIZE,
            shuffle=True,
        )

        self.test_loader = DataLoader(
            test_dataset,
            batch_size=BATCH_SIZE,
            shuffle=False,
        )

        # ---------------------------------------------------
        # Create Model
        # ---------------------------------------------------

        self.model = MLPIDS(
            input_size=INPUT_SIZE,
            num_classes=NUM_CLASSES,
        )

        # ---------------------------------------------------
        # Information
        # ---------------------------------------------------

        print("\n" + "-" * 60)

        print(
            f"Client ID          : {self.client_id}"
        )

        print(
            f"Training Samples   : "
            f"{len(train_dataset):,}"
        )

        print(
            f"Test Samples       : "
            f"{len(test_dataset):,}"
        )

        print(
            f"Features           : {INPUT_SIZE}"
        )

        print(
            f"Classes            : {NUM_CLASSES}"
        )

        print(
            f"Batch Size         : {BATCH_SIZE}"
        )

        print(
            f"Local Epochs       : {LOCAL_EPOCHS}"
        )

        print("-" * 60)

        print(
            f"Client {self.client_id} Ready"
        )

        print("=" * 60)

    # =======================================================
    # Get Parameters
    # =======================================================

    def get_parameters(self, config):

        return [
            value.detach()
            .cpu()
            .numpy()
            for value in self.model.state_dict().values()
        ]

    # =======================================================
    # Set Parameters
    # =======================================================

    def set_parameters(self, parameters):

        state_dict = self.model.state_dict()

        params_dict = zip(
            state_dict.keys(),
            parameters,
        )

        new_state_dict = {
            key: torch.tensor(
                value,
                dtype=state_dict[key].dtype,
            )
            for key, value in params_dict
        }

        self.model.load_state_dict(
            new_state_dict,
            strict=True,
        )

    # =======================================================
    # Federated Local Training
    # =======================================================

    def fit(
        self,
        parameters,
        config,
    ):

        print("\n" + "=" * 60)

        print(
            f"CLIENT {self.client_id} "
            "LOCAL TRAINING"
        )

        print("=" * 60)

        # ---------------------------------------------------
        # Receive Global Model
        # ---------------------------------------------------

        self.set_parameters(
            parameters
        )

        # ---------------------------------------------------
        # Local Training Information
        # ---------------------------------------------------

        print(
            f"Client ID       : "
            f"{self.client_id}"
        )

        print(
            f"Training Samples: "
            f"{len(self.train_loader.dataset):,}"
        )

        print(
            f"Local Epochs    : "
            f"{LOCAL_EPOCHS}"
        )

        # ---------------------------------------------------
        # Train Local Model
        # ---------------------------------------------------

        train_local_model(
            model=self.model,
            train_loader=self.train_loader,
            epochs=LOCAL_EPOCHS,
        )

        print(
            f"\nClient {self.client_id} "
            "Local Training Completed"
        )

        print("=" * 60)

        # ---------------------------------------------------
        # Return Updated Parameters
        # ---------------------------------------------------

        return (
            self.get_parameters(config),

            len(
                self.train_loader.dataset
            ),

            {
                "client_id": self.client_id,
            },
        )

    # =======================================================
    # Federated Evaluation
    # =======================================================

    def evaluate(
        self,
        parameters,
        config,
    ):

        print("\n" + "=" * 60)

        print(
            f"CLIENT {self.client_id} "
            "GLOBAL MODEL EVALUATION"
        )

        print("=" * 60)

        # ---------------------------------------------------
        # Receive Global Model
        # ---------------------------------------------------

        self.set_parameters(
            parameters
        )

        # ---------------------------------------------------
        # Evaluate
        # ---------------------------------------------------

        metrics = evaluate_model(
            self.model,
            self.test_loader,
        )

        # ---------------------------------------------------
        # Print Metrics
        # ---------------------------------------------------

        print(
            f"\nClient {self.client_id} Metrics"
        )

        print("-" * 60)

        print(
            f"Accuracy           : "
            f"{metrics['accuracy'] * 100:.4f}%"
        )

        print(
            f"Weighted Precision : "
            f"{metrics['precision'] * 100:.4f}%"
        )

        print(
            f"Weighted Recall    : "
            f"{metrics['recall'] * 100:.4f}%"
        )

        print(
            f"Weighted F1        : "
            f"{metrics['f1'] * 100:.4f}%"
        )

        print(
            f"Macro Precision    : "
            f"{metrics['macro_precision'] * 100:.4f}%"
        )

        print(
            f"Macro Recall       : "
            f"{metrics['macro_recall'] * 100:.4f}%"
        )

        print(
            f"Macro F1           : "
            f"{metrics['macro_f1'] * 100:.4f}%"
        )

        print("=" * 60)

        # ---------------------------------------------------
        # Flower Evaluation Result
        # ---------------------------------------------------

        return (
            float(
                1.0 - metrics["accuracy"]
            ),

            len(
                self.test_loader.dataset
            ),

            {
                "accuracy": float(
                    metrics["accuracy"]
                ),

                "precision": float(
                    metrics["precision"]
                ),

                "recall": float(
                    metrics["recall"]
                ),

                "f1": float(
                    metrics["f1"]
                ),

                "macro_precision": float(
                    metrics["macro_precision"]
                ),

                "macro_recall": float(
                    metrics["macro_recall"]
                ),

                "macro_f1": float(
                    metrics["macro_f1"]
                ),
            },
        )


# =======================================================
# Main
# =======================================================

def main():

    # ---------------------------------------------------
    # Default Client
    # ---------------------------------------------------

    client_id = 0

    # ---------------------------------------------------
    # Read Client ID
    # ---------------------------------------------------

    if len(sys.argv) > 1:

        try:

            client_id = int(
                sys.argv[1]
            )

        except ValueError:

            raise ValueError(
                "Client ID must be an integer."
            )

    # ---------------------------------------------------
    # Validate
    # ---------------------------------------------------

    if client_id not in range(NUM_CLIENTS):

        raise ValueError(
            f"Invalid client ID: {client_id}. "
            f"Use a value from "
            f"0 to {NUM_CLIENTS - 1}."
        )

    # ---------------------------------------------------
    # Create Client
    # ---------------------------------------------------

    client = FlowerClient(
        client_id=client_id
    )

    # ---------------------------------------------------
    # Connect to Flower Server
    # ---------------------------------------------------

    print("\n" + "=" * 60)

    print(
        f"Connecting Client {client_id}"
    )

    print(
        f"Flower Server : "
        f"{SERVER_ADDRESS}"
    )

    print("=" * 60)

    # ---------------------------------------------------
    # Start Flower Client
    # ---------------------------------------------------

    fl.client.start_numpy_client(
        server_address=SERVER_ADDRESS,
        client=client,
    )


# =======================================================
# Entry Point
# =======================================================

if __name__ == "__main__":

    main()