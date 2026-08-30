import csv
import json
import os

RESULTS_DIR = "results"

INPUT_FILE = os.path.join(
    RESULTS_DIR,
    "confusion_matrix.csv"
)

JSON_FILE = os.path.join(
    RESULTS_DIR,
    "confusion_matrix_analysis.json"
)

TXT_FILE = os.path.join(
    RESULTS_DIR,
    "confusion_matrix_analysis.txt"
)

# ---------------------------------------------------------
# Load confusion matrix
# ---------------------------------------------------------

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    rows = list(
        csv.reader(file)
    )

classes = rows[0][1:]

matrix = []

for row in rows[1:]:

    matrix.append(
        [int(x) for x in row[1:]]
    )

# ---------------------------------------------------------
# Calculate statistics
# ---------------------------------------------------------

analysis = []

for i, class_name in enumerate(classes):

    actual = sum(matrix[i])

    true_positive = matrix[i][i]

    predicted = sum(
        matrix[r][i]
        for r in range(len(classes))
    )

    false_positive = (
        predicted - true_positive
    )

    false_negative = (
        actual - true_positive
    )

    recall = (
        true_positive / actual
        if actual > 0
        else 0.0
    )

    precision = (
        true_positive / predicted
        if predicted > 0
        else 0.0
    )

    analysis.append(
        {
            "class": class_name,
            "support": actual,
            "true_positive": true_positive,
            "false_positive": false_positive,
            "false_negative": false_negative,
            "recall": recall,
            "precision": precision
        }
    )

# ---------------------------------------------------------
# Most confused class pairs
# ---------------------------------------------------------

confusions = []

for i in range(len(classes)):

    for j in range(len(classes)):

        if i == j:
            continue

        count = matrix[i][j]

        if count > 0:

            confusions.append(
                {
                    "actual": classes[i],
                    "predicted": classes[j],
                    "count": count
                }
            )

confusions.sort(
    key=lambda x: x["count"],
    reverse=True
)

# ---------------------------------------------------------
# Save JSON
# ---------------------------------------------------------

result = {
    "classes": classes,
    "per_class": analysis,
    "most_common_confusions": confusions[:20]
}

with open(
    JSON_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        result,
        file,
        indent=4
    )

# ---------------------------------------------------------
# Save readable report
# ---------------------------------------------------------

with open(
    TXT_FILE,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "FEDERATED IDS CONFUSION MATRIX ANALYSIS\n"
    )

    file.write(
        "=" * 70 + "\n\n"
    )

    file.write(
        "PER-CLASS ANALYSIS\n"
    )

    file.write(
        "-" * 70 + "\n"
    )

    for item in analysis:

        file.write(
            f"\nClass: {item['class']}\n"
        )

        file.write(
            f"Support: {item['support']}\n"
        )

        file.write(
            f"True Positive: {item['true_positive']}\n"
        )

        file.write(
            f"False Positive: {item['false_positive']}\n"
        )

        file.write(
            f"False Negative: {item['false_negative']}\n"
        )

        file.write(
            f"Precision: {item['precision']:.6f}\n"
        )

        file.write(
            f"Recall: {item['recall']:.6f}\n"
        )

    file.write(
        "\n\nMOST COMMON MISCLASSIFICATIONS\n"
    )

    file.write(
        "-" * 70 + "\n"
    )

    for item in confusions[:20]:

        file.write(
            f"{item['actual']} -> "
            f"{item['predicted']} : "
            f"{item['count']}\n"
        )

print("=" * 70)
print("CONFUSION MATRIX ANALYSIS COMPLETED")
print("=" * 70)

print(
    f"Saved: {JSON_FILE}"
)

print(
    f"Saved: {TXT_FILE}"
)

print("\nTop 10 misclassifications:")

for item in confusions[:10]:

    print(
        f"{item['actual']} -> "
        f"{item['predicted']} : "
        f"{item['count']}"
    )