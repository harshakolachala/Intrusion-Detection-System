"""
Flower federated learning server.
Aggregates client model weights using FedAvg across rounds,
then saves the final global model.

Run this FIRST, then start each client in separate terminals.
"""

import flwr as fl
import torch
import numpy as np
from model import IDS_MLP

NUM_ROUNDS = 5
MIN_CLIENTS = 3  # set to 1 for the initial single-client smoke test

model = IDS_MLP(input_dim=78, num_classes=15)


def get_initial_parameters():
    return [val.cpu().numpy() for val in model.state_dict().values()]


class SaveModelStrategy(fl.server.strategy.FedAvg):
    """Wraps FedAvg to save the global model after the final round."""

    def aggregate_fit(self, server_round, results, failures):
        aggregated_parameters, aggregated_metrics = super().aggregate_fit(
            server_round, results, failures
        )

        if aggregated_parameters is not None:
            print(f"\n=== Round {server_round} complete, aggregating {len(results)} client updates ===\n")

            if server_round == NUM_ROUNDS:
                ndarrays = fl.common.parameters_to_ndarrays(aggregated_parameters)
                params_dict = zip(model.state_dict().keys(), ndarrays)
                state_dict = {k: torch.tensor(v) for k, v in params_dict}
                model.load_state_dict(state_dict, strict=True)
                torch.save(model.state_dict(), "global_model.pt")
                print("Final global model saved to global_model.pt")

        return aggregated_parameters, aggregated_metrics

    def aggregate_evaluate(self, server_round, results, failures):
        loss, metrics = super().aggregate_evaluate(server_round, results, failures)
        accuracies = [r.metrics["accuracy"] for _, r in results]
        avg_acc = sum(accuracies) / len(accuracies) if accuracies else 0
        print(f"[Round {server_round}] Avg client accuracy: {avg_acc:.4f}, loss: {loss:.4f}")
        return loss, metrics


strategy = SaveModelStrategy(
    min_fit_clients=MIN_CLIENTS,
    min_evaluate_clients=MIN_CLIENTS,
    min_available_clients=MIN_CLIENTS,
    initial_parameters=fl.common.ndarrays_to_parameters(get_initial_parameters()),
)

if __name__ == "__main__":
    fl.server.start_server(
        server_address="127.0.0.1:8081",
        config=fl.server.ServerConfig(num_rounds=NUM_ROUNDS),
        strategy=strategy,
    )