import os

import flwr as fl
import torch

from federated.config import (
    INPUT_SIZE,
    NUM_CLASSES,
    NUM_CLIENTS,
    MODEL_PATH,
)

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
            input_size=INPUT_SIZE,
            num_classes=NUM_CLASSES,
        )

        params_dict = zip(
            model.state_dict().keys(),
            fl.common.parameters_to_ndarrays(parameters),
        )

        state_dict = {
            key: torch.tensor(value)
            for key, value in params_dict
        }

        model.load_state_dict(
            state_dict,
            strict=True,
        )

        os.makedirs(
            os.path.dirname(MODEL_PATH),
            exist_ok=True,
        )

        torch.save(
            model.state_dict(),
            MODEL_PATH,
        )

        print("\n" + "=" * 60)
        print(f"Global model saved after Round {server_round}")
        print(f"Location : {MODEL_PATH}")
        print("=" * 60 + "\n")

        return aggregated


def get_strategy():

    return SaveModelStrategy(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=NUM_CLIENTS,
        min_evaluate_clients=NUM_CLIENTS,
        min_available_clients=NUM_CLIENTS,
    )