import flwr as fl

from federated.config import (
    SERVER_ADDRESS,
    NUM_ROUNDS,
)

from federated.strategy import get_strategy


def main():

    print("=" * 60)
    print("SentinelAI Federated Learning Server")
    print("=" * 60)
    print(f"Server Address : {SERVER_ADDRESS}")
    print(f"Federated Rounds : {NUM_ROUNDS}")
    print("Model : Multi-Class IDS (15 Classes)")
    print("=" * 60)

    fl.server.start_server(
        server_address=SERVER_ADDRESS,
        config=fl.server.ServerConfig(
            num_rounds=NUM_ROUNDS
        ),
        strategy=get_strategy(),
    )


if __name__ == "__main__":
    main()