"""
Flower Federated Learning Client.

Each client:
1. Loads a local partition of the IDS dataset
2. Receives the global model from the Flower server
3. Trains locally
4. Sends updated parameters back to the server
5. Evaluates the received global model
"""

import sys

import flwr as fl
import torch

from federated.config import (
    SERVER_ADDRESS,
    INPUT_SIZE,
    NUM_CLASSES,
    LOCAL_EPOCHS,
)

from federated.dataset import IDSDataset
from federated.model import MLPIDS
from federated.train import train_local_model
from federated.evaluate import evaluate_model


# -------------------------------------------------------
# Startup
# -------------------------------------------------------

print("=" * 60)
print("Starting Flower Client")
print("=" * 60)


class FlowerClient(fl.client.NumPyClient):
    """
    Flower client for federated intrusion detection.
    """

    def __init__(self, client_id=0):

        print(f"\nInitializing Client {client_id}")

        # ---------------------------------------------------
        # Validate Client ID
        # ---------------------------------------------------

        if client_id not in [0, 1, 2]:

            raise ValueError(
                "Invalid client_id. "
                "Client ID must be 0, 1, or 2."
            )

        self.client_id = client_id

        # ---------------------------------------------------
        # Load Dataset
        # ---------------------------------------------------
        #
        # Development mode is intentionally used for the
        # first federated experiment.
        #
        # 300,000 samples are loaded and divided among
        # 3 clients.
        #
        # Therefore approximately:
        #
        # Client 0 -> 80,000 samples
        # Client 1 -> 80,000 samples
        # Client 2 -> 80,000 samples
        #
        # The exact number depends on the train/test split.
        #
        # We will move to the complete dataset after the
        # federated pipeline is verified.
        # ---------------------------------------------------

        print("Loading local dataset...")

        dataset = IDSDataset(
            development=True,
            sample_size=300000,
            num_clients=3,
        )

        (
            self.client_loaders,
            self.test_loader,
        ) = dataset.create_clients()

        print(
            f"Client {self.client_id} dataset ready."
        )

        # ---------------------------------------------------
        # Create Model
        # ---------------------------------------------------

        self.model = MLPIDS(
            input_size=INPUT_SIZE,
            num_classes=NUM_CLASSES,
        )

        print(
            f"Client {self.client_id} model initialized."
        )

        print("=" * 60)
        print(
            f"Client {self.client_id} Ready"
        )
        print("=" * 60)

    # -------------------------------------------------------
    # Get Parameters
    # -------------------------------------------------------

    def get_parameters(self, config):

        return [
            value.detach().cpu().numpy()
            for value in self.model.state_dict().values()
        ]

    # -------------------------------------------------------
    # Set Parameters
    # -------------------------------------------------------

    def set_parameters(self, parameters):

        params_dict = zip(
            self.model.state_dict().keys(),
            parameters,
        )

        state_dict = {
            key: torch.tensor(
                value,
                dtype=self.model.state_dict()[key].dtype,
            )
            for key, value in params_dict
        }

        self.model.load_state_dict(
            state_dict,
            strict=True,
        )

    # -------------------------------------------------------
    # Federated Training
    # -------------------------------------------------------

    def fit(self, parameters, config):

        print("\n" + "=" * 60)
        print(
            f"CLIENT {self.client_id} LOCAL TRAINING"
        )
        print("=" * 60)

        # Receive global model
        self.set_parameters(parameters)

        # Select this client's local partition
        train_loader = self.client_loaders[
            self.client_id
        ]

        print(
            f"Client {self.client_id} samples : "
            f"{len(train_loader.dataset)}"
        )

        print(
            f"Local Epochs : {LOCAL_EPOCHS}"
        )

        # Train local model
        train_local_model(
            model=self.model,
            train_loader=train_loader,
            epochs=LOCAL_EPOCHS,
        )

        print(
            f"Client {self.client_id} "
            "Local Training Completed"
        )

        # Send updated model back to server
        return (
            self.get_parameters(config),
            len(train_loader.dataset),
            {
                "client_id": self.client_id,
            },
        )

    # -------------------------------------------------------
    # Federated Evaluation
    # -------------------------------------------------------

    def evaluate(self, parameters, config):

        print("\n" + "=" * 60)
        print(
            f"CLIENT {self.client_id} EVALUATION"
        )
        print("=" * 60)

        # Receive global model
        self.set_parameters(parameters)

        # Evaluate global model
        metrics = evaluate_model(
            self.model,
            self.test_loader,
        )

        print(
            f"\nClient {self.client_id} Metrics"
        )

        print(
            f"Accuracy  : "
            f"{metrics['accuracy'] * 100:.2f}%"
        )

        print(
            f"Precision : "
            f"{metrics['precision'] * 100:.2f}%"
        )

        print(
            f"Recall    : "
            f"{metrics['recall'] * 100:.2f}%"
        )

        print(
            f"F1 Score  : "
            f"{metrics['f1'] * 100:.2f}%"
        )

        print("=" * 60)

        return (
            float(
                1.0 - metrics["accuracy"]
            ),
            len(self.test_loader.dataset),
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
            },
        )


# -------------------------------------------------------
# Main
# -------------------------------------------------------

def main():

    # Default client
    client_id = 0

    # Read client ID from command line
    if len(sys.argv) > 1:

        try:

            client_id = int(
                sys.argv[1]
            )

        except ValueError:

            raise ValueError(
                "Client ID must be an integer: "
                "0, 1, or 2."
            )

    # Validate
    if client_id not in [0, 1, 2]:

        raise ValueError(
            "Invalid client ID. "
            "Use 0, 1, or 2."
        )

    # Create client
    client = FlowerClient(
        client_id=client_id
    )

    print("\n" + "=" * 60)
    print(
        f"Connecting Client {client_id}"
    )
    print(
        f"Flower Server : {SERVER_ADDRESS}"
    )
    print("=" * 60)

    # ---------------------------------------------------
    # Start Flower Client
    # ---------------------------------------------------

    fl.client.start_numpy_client(
        server_address=SERVER_ADDRESS,
        client=client,
    )


# -------------------------------------------------------
# Entry Point
# -------------------------------------------------------

if __name__ == "__main__":

    main()