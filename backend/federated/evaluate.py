import torch

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


def evaluate_model(
    model,
    test_loader,
    device=None,
):
    """
    Evaluate a multiclass IDS model.

    Returns:
        accuracy
        weighted precision
        weighted recall
        weighted F1
        macro precision
        macro recall
        macro F1
        confusion matrix
        classification report
    """

    # =======================================================
    # Device
    # =======================================================

    if device is None:

        device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

    model.to(device)

    model.eval()

    # =======================================================
    # Collect predictions
    # =======================================================

    all_labels = []
    all_predictions = []

    with torch.no_grad():

        for features, labels in test_loader:

            features = features.to(device)

            outputs = model(
                features
            )

            predictions = torch.argmax(
                outputs,
                dim=1,
            )

            all_labels.extend(
                labels.numpy()
            )

            all_predictions.extend(
                predictions.cpu().numpy()
            )

    # =======================================================
    # Accuracy
    # =======================================================

    accuracy = accuracy_score(
        all_labels,
        all_predictions,
    )

    # =======================================================
    # Weighted Metrics
    # =======================================================

    weighted_precision = precision_score(
        all_labels,
        all_predictions,
        average="weighted",
        zero_division=0,
    )

    weighted_recall = recall_score(
        all_labels,
        all_predictions,
        average="weighted",
        zero_division=0,
    )

    weighted_f1 = f1_score(
        all_labels,
        all_predictions,
        average="weighted",
        zero_division=0,
    )

    # =======================================================
    # Macro Metrics
    # =======================================================

    macro_precision = precision_score(
        all_labels,
        all_predictions,
        average="macro",
        zero_division=0,
    )

    macro_recall = recall_score(
        all_labels,
        all_predictions,
        average="macro",
        zero_division=0,
    )

    macro_f1 = f1_score(
        all_labels,
        all_predictions,
        average="macro",
        zero_division=0,
    )

    # =======================================================
    # Confusion Matrix
    # =======================================================

    cm = confusion_matrix(
        all_labels,
        all_predictions,
    )

    # =======================================================
    # Classification Report
    # =======================================================

    report = classification_report(
        all_labels,
        all_predictions,
        zero_division=0,
    )

    # =======================================================
    # Print Results
    # =======================================================

    print(
        "\n" + "=" * 60
    )

    print(
        "Evaluation Results"
    )

    print(
        "=" * 60
    )

    print(
        f"Accuracy           : "
        f"{accuracy * 100:.4f}%"
    )

    print(
        f"Weighted Precision : "
        f"{weighted_precision * 100:.4f}%"
    )

    print(
        f"Weighted Recall    : "
        f"{weighted_recall * 100:.4f}%"
    )

    print(
        f"Weighted F1        : "
        f"{weighted_f1 * 100:.4f}%"
    )

    print(
        "\nMacro Metrics"
    )

    print(
        "-" * 60
    )

    print(
        f"Macro Precision    : "
        f"{macro_precision * 100:.4f}%"
    )

    print(
        f"Macro Recall       : "
        f"{macro_recall * 100:.4f}%"
    )

    print(
        f"Macro F1           : "
        f"{macro_f1 * 100:.4f}%"
    )

    print(
        "\nClassification Report"
    )

    print(
        report
    )

    print(
        "\nConfusion Matrix"
    )

    print(
        cm
    )

    print(
        "=" * 60
    )

    return {
        "accuracy": float(
            accuracy
        ),

        "precision": float(
            weighted_precision
        ),

        "recall": float(
            weighted_recall
        ),

        "f1": float(
            weighted_f1
        ),

        "macro_precision": float(
            macro_precision
        ),

        "macro_recall": float(
            macro_recall
        ),

        "macro_f1": float(
            macro_f1
        ),

        "classification_report": report,

        "confusion_matrix": cm,
    }