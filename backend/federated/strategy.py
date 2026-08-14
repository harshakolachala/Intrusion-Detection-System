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
    Custom FedAvg strategy.

    Responsibilities:
        1. Federated averaging
        2. Save global model after every round
        3. Aggregate client evaluation metrics
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
        # Weighted loss
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
        # Print aggregated metrics
        # ---------------------------------------------------

        print(
            "\n" + "=" * 60
        )

        print(
            f"GLOBAL EVALUATION - ROUND {server_round}"
        )

        print(
            "=" * 60
        )

        print(
            f"Loss       : {weighted_loss:.6f}"
        )

        print(
            f"Accuracy   : {accuracy * 100:.4f}%"
        )

        print(
            f"Precision  : {precision * 100:.4f}%"
        )

        print(
            f"Recall     : {recall * 100:.4f}%"
        )

        print(
            f"F1 Score   : {f1 * 100:.4f}%"
        )

        print(
            "=" * 60
        )

        return (
            float(weighted_loss),
            {
                "accuracy": float(accuracy),
                "precision": float(precision),
                "recall": float(recall),
                "f1": float(f1),
            },
        )


# ===========================================================
# Strategy Factory
# ===========================================================

def get_strategy():

    return SaveModelStrategy(
        fraction_fit=1.0,
        fraction_evaluate=1.0,

        min_fit_clients=NUM_CLIENTS,
        min_evaluate_clients=NUM_CLIENTS,
        min_available_clients=NUM_CLIENTS,
    )