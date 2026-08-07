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

print("Starting Flower Client...")


class FlowerClient(fl.client.NumPyClient):

    def __init__(self, client_id=0):

        print(f"Initializing Client {client_id}")

        self.client_id = client_id

        # Development mode (uses a sampled dataset).
        # Change development=False for final training on the full dataset.
        dataset = IDSDataset(
            development=True,
            sample_size=300000,
        )

        self.client_loaders, self.test_loader = dataset.create_clients()

        self.model = MLPIDS(
            input_size=INPUT_SIZE,
            num_classes=NUM_CLASSES,
        )

        print(f"Client {client_id} Ready")

    def get_parameters(self, config):

        return [
            value.cpu().numpy()
            for value in self.model.state_dict().values()
        ]

    def set_parameters(self, parameters):

        params_dict = zip(
            self.model.state_dict().keys(),
            parameters,
        )

        state_dict = {
            key: torch.tensor(value)
            for key, value in params_dict
        }

        self.model.load_state_dict(
            state_dict,
            strict=True,
        )

    def fit(self, parameters, config):

        print(f"\n========== Client {self.client_id} Training ==========")

        self.set_parameters(parameters)

        train_local_model(
            model=self.model,
            train_loader=self.client_loaders[self.client_id],
            epochs=LOCAL_EPOCHS,
        )

        print("Local Training Completed")

        return (
            self.get_parameters(config),
            len(self.client_loaders[self.client_id].dataset),
            {},
        )

    def evaluate(self, parameters, config):

        print(f"\n========== Client {self.client_id} Evaluation ==========")

        self.set_parameters(parameters)

        metrics = evaluate_model(
            self.model,
            self.test_loader,
        )

        print(
            f"Accuracy : {metrics['accuracy']:.4f} | "
            f"Precision : {metrics['precision']:.4f} | "
            f"Recall : {metrics['recall']:.4f} | "
            f"F1 : {metrics['f1']:.4f}"
        )

        return (
            float(1 - metrics["accuracy"]),
            len(self.test_loader.dataset),
            {
                "accuracy": float(metrics["accuracy"]),
                "precision": float(metrics["precision"]),
                "recall": float(metrics["recall"]),
                "f1": float(metrics["f1"]),
            },
        )


def main():

    client_id = 0

    if len(sys.argv) > 1:
        client_id = int(sys.argv[1])

    client = FlowerClient(client_id=client_id)

    print(f"Connecting Client {client_id} to Flower Server...")

    fl.client.start_numpy_client(
        server_address=SERVER_ADDRESS,
        client=client,
    )


if __name__ == "__main__":
    main()