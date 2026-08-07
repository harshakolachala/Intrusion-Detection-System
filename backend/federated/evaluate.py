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
    Evaluate the trained multiclass IDS model.
    """

    if device is None:
        device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    model.to(device)

    model.eval()

    all_labels = []

    all_predictions = []

    with torch.no_grad():

        for features, labels in test_loader:

            features = features.to(device)

            labels = labels.to(device)

            outputs = model(features)

            _, predictions = torch.max(
                outputs,
                dim=1,
            )

            all_labels.extend(
                labels.cpu().numpy()
            )

            all_predictions.extend(
                predictions.cpu().numpy()
            )

    accuracy = accuracy_score(
        all_labels,
        all_predictions,
    )

    precision = precision_score(
        all_labels,
        all_predictions,
        average="weighted",
        zero_division=0,
    )

    recall = recall_score(
        all_labels,
        all_predictions,
        average="weighted",
        zero_division=0,
    )

    f1 = f1_score(
        all_labels,
        all_predictions,
        average="weighted",
        zero_division=0,
    )

    cm = confusion_matrix(
        all_labels,
        all_predictions,
    )

    report = classification_report(
        all_labels,
        all_predictions,
        zero_division=0,
    )

    print("\n" + "=" * 60)
    print("Evaluation Results")
    print("=" * 60)

    print(f"Accuracy  : {accuracy*100:.2f}%")
    print(f"Precision : {precision*100:.2f}%")
    print(f"Recall    : {recall*100:.2f}%")
    print(f"F1 Score  : {f1*100:.2f}%")

    print("\nClassification Report")
    print(report)

    print("\nConfusion Matrix")
    print(cm)

    print("=" * 60)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "classification_report": report,
        "confusion_matrix": cm,
    }