import flwr as fl

from federated.config import NUM_CLIENTS


def get_strategy():
    """
    Returns the Flower FedAvg strategy.
    """

    strategy = fl.server.strategy.FedAvg(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=NUM_CLIENTS,
        min_evaluate_clients=NUM_CLIENTS,
        min_available_clients=NUM_CLIENTS,
    )

    return strategy