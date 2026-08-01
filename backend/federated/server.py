import flwr as fl

from federated.config import (
    SERVER_ADDRESS,
    NUM_ROUNDS,
)

from federated.strategy import get_strategy


def main():

    print("=" * 50)
    print("Starting Flower Server")
    print("=" * 50)
    print(f"Server Address : {SERVER_ADDRESS}")
    print(f"Federated Rounds : {NUM_ROUNDS}")
    print("=" * 50)

    fl.server.start_server(
        server_address=SERVER_ADDRESS,
        config=fl.server.ServerConfig(
            num_rounds=NUM_ROUNDS
        ),
        strategy=get_strategy(),
    )


if __name__ == "__main__":
    main()