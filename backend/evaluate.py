"""
Unified held-out evaluation: baseline (non-federated) vs. FL global model.

What this does
---------------
1. Builds ONE global held-out test set by pooling all client shards
   (data/clients/client{0,1,2}_{X,y}.npy) and carving out a stratified
   20% slice that neither the baseline nor the FL model should have been
   trained on. Saved once to data/clients/global_holdout_{X,y}.npy so both
   models are always judged on the exact same data.
2. Loads backend/baseline_model.pt (always expected to exist).
3. Loads backend/global_model.pt if present (Hasini's FL output). If it's
   not there yet, the script still runs and reports baseline-only results,
   and clearly says the FL comparison is pending.
4. Prints + saves per-class precision/recall/F1, overall accuracy, macro F1,
   weighted F1 for whichever model(s) are available.
5. Writes:
     backend/reports/fl_vs_baseline_results.json   (raw numbers)
     backend/reports/fl_vs_baseline.md             (comparison writeup)

Run from backend/:
    python evaluate.py
"""

import json
import os
from datetime import datetime, timezone

import numpy as np
import torch
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

from model import IDS_MLP

DATA_DIR = "data/clients"
N_CLIENTS = 3
HOLDOUT_FRACTION = 0.2
RANDOM_SEED = 42

BASELINE_MODEL_PATH = "baseline_model.pt"
GLOBAL_MODEL_PATH = "global_model.pt"
REPORTS_DIR = "reports"


# --------------------------------------------------------------------------
# Held-out set construction
# --------------------------------------------------------------------------

def _load_all_client_shards(data_dir: str, n_clients: int):
    Xs, ys = [], []
    for i in range(n_clients):
        x_path = os.path.join(data_dir, f"client{i}_X.npy")
        y_path = os.path.join(data_dir, f"client{i}_y.npy")
        if not os.path.exists(x_path) or not os.path.exists(y_path):
            raise FileNotFoundError(
                f"Missing {x_path} or {y_path}. Run preprocess.py first."
            )
        Xs.append(np.load(x_path))
        ys.append(np.load(y_path))
    return np.concatenate(Xs), np.concatenate(ys)


def get_or_build_global_holdout(data_dir: str = DATA_DIR, n_clients: int = N_CLIENTS):
    """Return (X_holdout, y_holdout), building + caching it on first run."""
    x_out = os.path.join(data_dir, "global_holdout_X.npy")
    y_out = os.path.join(data_dir, "global_holdout_y.npy")

    if os.path.exists(x_out) and os.path.exists(y_out):
        return np.load(x_out), np.load(y_out)

    print("Building global held-out set from all client shards (first run only)...")
    X, y = _load_all_client_shards(data_dir, n_clients)

    # Some ultra-rare classes (e.g. Heartbleed, ~11 samples total) can't be
    # stratified into a split. Fall back to a non-stratified split for those.
    try:
        _, X_holdout, _, y_holdout = train_test_split(
            X, y, test_size=HOLDOUT_FRACTION, random_state=RANDOM_SEED, stratify=y
        )
    except ValueError as exc:
        print(f"Stratified split failed ({exc}); falling back to a random split.")
        _, X_holdout, _, y_holdout = train_test_split(
            X, y, test_size=HOLDOUT_FRACTION, random_state=RANDOM_SEED
        )

    np.save(x_out, X_holdout)
    np.save(y_out, y_holdout)
    print(f"Saved global held-out set: {X_holdout.shape[0]} samples -> {x_out}")
    return X_holdout, y_holdout


# --------------------------------------------------------------------------
# Model loading (infers architecture from the checkpoint itself, so it
# doesn't matter how many classes each model happened to be trained on)
# --------------------------------------------------------------------------

def load_model(path: str) -> IDS_MLP:
    state_dict = torch.load(path, map_location="cpu")
    input_dim = state_dict["net.0.weight"].shape[1]
    num_classes = state_dict["net.6.weight"].shape[0]
    model = IDS_MLP(input_dim=input_dim, num_classes=num_classes)
    model.load_state_dict(state_dict)
    model.eval()
    return model


def evaluate_model(model: IDS_MLP, X: np.ndarray, y: np.ndarray, label_names=None):
    """Evaluate model on (X, y). Samples whose label the model was never
    trained to output (index >= model's num_classes) are excluded and the
    count is reported, rather than crashing the whole evaluation."""
    num_classes = model.net[-1].out_features
    valid_mask = y < num_classes
    excluded = int((~valid_mask).sum())

    X_eval, y_eval = X[valid_mask], y[valid_mask]

    with torch.no_grad():
        logits = model(torch.tensor(X_eval, dtype=torch.float32))
        preds = logits.argmax(dim=1).numpy()

    target_names = None
    if label_names is not None:
        target_names = [str(label_names[i]) for i in range(num_classes)]

    report = classification_report(
        y_eval, preds, target_names=target_names, output_dict=True, zero_division=0
    )
    accuracy = float((preds == y_eval).mean())

    return {
        "accuracy": accuracy,
        "macro_f1": report["macro avg"]["f1-score"],
        "weighted_f1": report["weighted avg"]["f1-score"],
        "per_class": report,
        "excluded_unseen_label_samples": excluded,
        "n_eval_samples": int(len(y_eval)),
    }


# --------------------------------------------------------------------------
# Report generation
# --------------------------------------------------------------------------

def write_markdown_report(results: dict, out_path: str):
    lines = [
        "# FL vs. Baseline -- Held-Out Evaluation",
        "",
        f"_Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} by evaluate.py_",
        "",
        "Both models below are scored on the exact same pooled, stratified "
        "20% held-out set (`data/clients/global_holdout_*.npy`), built once "
        "from all three client shards so neither model has an unfair "
        "data-overlap advantage.",
        "",
        "## Summary",
        "",
        "| Model | Accuracy | Macro F1 | Weighted F1 | Eval samples | Excluded (unseen label) |",
        "|---|---|---|---|---|---|",
    ]

    for name, key in [("Baseline (single client, no FL)", "baseline"), ("FL Global Model", "fl_global")]:
        r = results.get(key)
        if r is None:
            lines.append(f"| {name} | - | - | - | - | not yet available |")
        else:
            lines.append(
                f"| {name} | {r['accuracy']:.4f} | {r['macro_f1']:.4f} | "
                f"{r['weighted_f1']:.4f} | {r['n_eval_samples']} | {r['excluded_unseen_label_samples']} |"
            )

    lines += ["", "## Notes", ""]

    if "fl_global" not in results:
        lines.append(
            "- `backend/global_model.pt` was not found, so this report only "
            "covers the baseline model. Re-run `python evaluate.py` once the "
            "FL training script has produced `global_model.pt` to fill in "
            "the comparison."
        )
    else:
        base, fl = results["baseline"], results["fl_global"]
        delta_acc = fl["accuracy"] - base["accuracy"]
        delta_f1 = fl["macro_f1"] - base["macro_f1"]
        direction = "improves on" if delta_f1 > 0 else "trails"
        lines.append(
            f"- The FL global model {direction} the single-client baseline by "
            f"{delta_f1:+.4f} macro F1 ({delta_acc:+.4f} accuracy). Macro F1 "
            "matters more than accuracy here because CICIDS2017 is heavily "
            "class-imbalanced (e.g. BENIGN vs. Heartbleed's ~11 samples)."
        )
        lines.append(
            "- Per-class numbers for both models are in "
            "`fl_vs_baseline_results.json` for a deeper minority-class look "
            "(worth highlighting Heartbleed/Infiltration in the writeup, "
            "since those are the classes FL's cross-client data diversity "
            "should help with most)."
        )

    lines.append(
        "- Baseline was trained on a single client's local data only "
        "(`train_baseline.py`, client0); any class missing from that "
        "client's shard is excluded from its scoring here rather than "
        "counted as wrong, since the model was never able to predict it."
    )

    with open(out_path, "w") as f:
        f.write("\n".join(lines) + "\n")


def main():
    os.makedirs(REPORTS_DIR, exist_ok=True)

    X_holdout, y_holdout = get_or_build_global_holdout()
    print(f"Global held-out set: {X_holdout.shape[0]} samples, {len(np.unique(y_holdout))} classes present")

    label_names = None
    label_path = os.path.join(DATA_DIR, "label_classes.npy")
    if os.path.exists(label_path):
        label_names = np.load(label_path, allow_pickle=True)

    results = {}

    print(f"\nEvaluating baseline model ({BASELINE_MODEL_PATH})...")
    baseline_model = load_model(BASELINE_MODEL_PATH)
    results["baseline"] = evaluate_model(baseline_model, X_holdout, y_holdout, label_names)
    print(
        f"  accuracy={results['baseline']['accuracy']:.4f}  "
        f"macro_f1={results['baseline']['macro_f1']:.4f}  "
        f"(excluded {results['baseline']['excluded_unseen_label_samples']} unseen-label samples)"
    )

    if os.path.exists(GLOBAL_MODEL_PATH):
        print(f"\nEvaluating FL global model ({GLOBAL_MODEL_PATH})...")
        fl_model = load_model(GLOBAL_MODEL_PATH)
        results["fl_global"] = evaluate_model(fl_model, X_holdout, y_holdout, label_names)
        print(
            f"  accuracy={results['fl_global']['accuracy']:.4f}  "
            f"macro_f1={results['fl_global']['macro_f1']:.4f}  "
            f"(excluded {results['fl_global']['excluded_unseen_label_samples']} unseen-label samples)"
        )
    else:
        print(
            f"\n{GLOBAL_MODEL_PATH} not found -- skipping FL comparison for now "
            "(this is expected until the FL training script produces it)."
        )

    results_path = os.path.join(REPORTS_DIR, "fl_vs_baseline_results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nSaved raw results -> {results_path}")

    md_path = os.path.join(REPORTS_DIR, "fl_vs_baseline.md")
    write_markdown_report(results, md_path)
    print(f"Saved writeup -> {md_path}")


if __name__ == "__main__":
    main()
