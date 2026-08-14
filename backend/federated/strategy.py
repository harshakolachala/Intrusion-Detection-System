import os
import csv

import flwr as fl
import torch

from federated.config import (
    INPUT_SIZE,
    NUM_CLASSES,
    NUM_CLIENTS,
    MODEL_PATH,
)


from federated.model import MLPIDS


# ===========================================================
# Results Configuration
# ===========================================================

RESULTS_DIR = "results"

ROUND_METRICS_FILE = os.path.join(
    RESULTS_DIR,
    "federated_round_metrics.csv",
)


# ===========================================================
# Results Directory
# ===========================================================

os.makedirs(
    RESULTS_DIR,
    exist_ok=True,
)


# ===========================================================
# Initialize Round Metrics File
# ===========================================================

def initialize_metrics_file():

    if not os.path.exists(
        ROUND_METRICS_FILE
    ):

        with open(
            ROUND_METRICS_FILE,
            "w",
            newline="",
            encoding="utf-8",
        ) as file:

            writer = csv.writer(file)

            writer.writerow(
                [
                    "round",
                    "loss",
                    "accuracy",
                    "precision",
                    "recall",
                    "f1",
                ]
            )


# ===========================================================
# Save Round Metrics
# ===========================================================

def save_round_metrics(
    server_round,
    loss,
    accuracy,
    precision,
    recall,
    f1,
):

    with open(
        ROUND_METRICS_FILE,
        "a",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.writer(file)

        writer.writerow(
            [
                server_round,
                f"{loss:.8f}",
                f"{accuracy:.8f}",
                f"{precision:.8f}",
                f"{recall:.8f}",
                f"{f1:.8f}",
            ]
        )


# ===========================================================
# Custom FedAvg Strategy
# ===========================================================

class SaveModelStrategy(fl.server.strategy.FedAvg):
    """
    Custom FedAvg strategy.

    Responsibilities:

        1. Federated averaging
        2. Save global model after every round
        3. Aggregate client evaluation metrics
        4. Save round-by-round metrics for research
    """

    # =======================================================
    # Aggregate Training Results
    # =======================================================

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

        # ---------------------------------------------------
        # Convert Flower parameters to PyTorch model
        # ---------------------------------------------------

        model = MLPIDS(
            input_size=INPUT_SIZE,
            num_classes=NUM_CLASSES,
        )

        params_dict = zip(
            model.state_dict().keys(),
            fl.common.parameters_to_ndarrays(
                parameters
            ),
        )

        state_dict = {
            key: torch.tensor(
                value,
                dtype=model.state_dict()[key].dtype,
            )
            for key, value in params_dict
        }

        model.load_state_dict(
            state_dict,
            strict=True,
        )

        # ---------------------------------------------------
        # Save global model
        # ---------------------------------------------------

        os.makedirs(
            os.path.dirname(MODEL_PATH),
            exist_ok=True,
        )

        torch.save(
            model.state_dict(),
            MODEL_PATH,
        )

        print(
            "\n" + "=" * 60
        )

        print(
            f"Global model saved after Round "
            f"{server_round}"
        )

        print(
            f"Location : {MODEL_PATH}"
        )

        print(
            "=" * 60 + "\n"
        )

        return aggregated

    # =======================================================
    # Aggregate Evaluation Results
    # =======================================================

    def aggregate_evaluate(
        self,
        server_round,
        results,
        failures,
    ):
        """
        Aggregate evaluation loss and metrics from clients.

        Client metrics are weighted by the number of
        evaluation samples.

        Round-level metrics are also saved to:

            results/federated_round_metrics.csv
        """

        if not results:

            return None

        total_examples = sum(
            evaluate_res.num_examples
            for _, evaluate_res in results
        )

        if total_examples == 0:

            return None

        # ---------------------------------------------------
        # Weighted Loss
        # ---------------------------------------------------

        weighted_loss = sum(
            evaluate_res.loss
            * evaluate_res.num_examples
            for _, evaluate_res in results
        ) / total_examples

        # ---------------------------------------------------
        # Weighted Accuracy
        # ---------------------------------------------------

        accuracy = sum(
            evaluate_res.metrics.get(
                "accuracy",
                0.0,
            )
            * evaluate_res.num_examples
            for _, evaluate_res in results
        ) / total_examples

        # ---------------------------------------------------
        # Weighted Precision
        # ---------------------------------------------------

        precision = sum(
            evaluate_res.metrics.get(
                "precision",
                0.0,
            )
            * evaluate_res.num_examples
            for _, evaluate_res in results
        ) / total_examples

        # ---------------------------------------------------
        # Weighted Recall
        # ---------------------------------------------------

        recall = sum(
            evaluate_res.metrics.get(
                "recall",
                0.0,
            )
            * evaluate_res.num_examples
            for _, evaluate_res in results
        ) / total_examples

        # ---------------------------------------------------
        # Weighted F1
        # ---------------------------------------------------

        f1 = sum(
            evaluate_res.metrics.get(
                "f1",
                0.0,
            )
            * evaluate_res.num_examples
            for _, evaluate_res in results
        ) / total_examples

        # ---------------------------------------------------
        # Save Round Metrics
        # ---------------------------------------------------

        initialize_metrics_file()

        save_round_metrics(
            server_round=server_round,
            loss=weighted_loss,
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1=f1,
        )

        # ---------------------------------------------------
        # Print Aggregated Metrics
        # ---------------------------------------------------

        print(
            "\n" + "=" * 60
        )

        print(
            f"GLOBAL EVALUATION - ROUND "
            f"{server_round}"
        )

        print(
            "=" * 60
        )

        print(
            f"Loss       : "
            f"{weighted_loss:.6f}"
        )

        print(
            f"Accuracy   : "
            f"{accuracy * 100:.4f}%"
        )

        print(
            f"Precision  : "
            f"{precision * 100:.4f}%"
        )

        print(
            f"Recall     : "
            f"{recall * 100:.4f}%"
        )

        print(
            f"F1 Score   : "
            f"{f1 * 100:.4f}%"
        )

        print(
            f"\nSaved     : "
            f"{ROUND_METRICS_FILE}"
        )

        print(
            "=" * 60
        )

        return (
            float(weighted_loss),
            {
                "accuracy": float(
                    accuracy
                ),
                "precision": float(
                    precision
                ),
                "recall": float(
                    recall
                ),
                "f1": float(
                    f1
                ),
            },
        )


# ===========================================================
# Strategy Factory
# ===========================================================

def get_strategy():

    initialize_metrics_file()

    return SaveModelStrategy(

        fraction_fit=1.0,

        fraction_evaluate=1.0,

        min_fit_clients=NUM_CLIENTS,

        min_evaluate_clients=NUM_CLIENTS,

        min_available_clients=NUM_CLIENTS,
    )