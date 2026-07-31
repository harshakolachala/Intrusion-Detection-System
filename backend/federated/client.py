import flwr as fl
import torch

from federated.dataset import IDSDataset
from federated.model import MLPIDS
from federated.train import train_local_model
from federated.evaluate import evaluate_model

print("Starting Flower Client...")


class FlowerClient(fl.client.NumPyClient):

    def __init__(self, client_id=0):
        print(f"Initializing Client {client_id}")

        self.client_id = client_id

        dataset = IDSDataset(
            development=True,
            sample_size=100000
        )

        self.client_loaders, self.test_loader = dataset.create_clients()

        self.model = MLPIDS(
            input_size=78,
            num_classes=2
        )

        print("Client Ready")

    def get_parameters(self, config):
        return [
            value.cpu().numpy()
            for value in self.model.state_dict().values()
        ]

    def set_parameters(self, parameters):
        params_dict = zip(
            self.model.state_dict().keys(),
            parameters
        )

        state_dict = {
            k: torch.tensor(v)
            for k, v in params_dict
        }

        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):

        print("Training Local Model...")

        self.set_parameters(parameters)

        train_local_model(
            self.model,
            self.client_loaders[self.client_id],
            epochs=1
        )

        return (
            self.get_parameters(config),
            len(self.client_loaders[self.client_id].dataset),
            {}
        )

    def evaluate(self, parameters, config):

        print("Evaluating Model...")

        self.set_parameters(parameters)

        metrics = evaluate_model(
            self.model,
            self.test_loader
        )

        return (
            float(1 - metrics["accuracy"]),
            len(self.test_loader.dataset),
            {
                "accuracy": float(metrics["accuracy"])
            }
        )


def main():

    client = FlowerClient(client_id=0)

    print("Connecting to Flower Server...")

    fl.client.start_numpy_client(
        server_address="127.0.0.1:8080",
        client=client,
    )


if __name__ == "__main__":
    main()