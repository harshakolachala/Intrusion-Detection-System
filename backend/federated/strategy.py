import os

import flwr as fl
import torch

from federated.config import NUM_CLIENTS
from federated.model import MLPIDS


class SaveModelStrategy(fl.server.strategy.FedAvg):
    """
    Custom Flower strategy that saves the aggregated
    global model after every federated round.
    """

    def aggregate_fit(
        self,
        server_round,
        results,
        failures,
    ):

        aggregated = super().aggregate_fit(
            server_round,
            results,
            failures,
        )

        if aggregated is None:
            return aggregated

        parameters, metrics = aggregated

        model = MLPIDS(
            input_size=78,
            num_classes=2,
        )

        params_dict = zip(
            model.state_dict().keys(),
            fl.common.parameters_to_ndarrays(parameters),
        )

        state_dict = {
            k: torch.tensor(v)
            for k, v in params_dict
        }

        model.load_state_dict(
            state_dict,
            strict=True,
        )

        os.makedirs("models", exist_ok=True)

        torch.save(
            model.state_dict(),
            "models/global_model.pth",
        )

        print(
            f"\nGlobal model saved after Round {server_round}\n"
        )

        return aggregated


def get_strategy():

    return SaveModelStrategy(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=NUM_CLIENTS,
        min_evaluate_clients=NUM_CLIENTS,
        min_available_clients=NUM_CLIENTS,
    )