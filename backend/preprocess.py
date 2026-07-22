"""
Preprocessing script for CICIDS2017 dataset.
Loads all 8 daily CSVs, cleans them, encodes labels, scales features,
and splits into N shards to simulate federated clients.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os
import glob

RAW_DATA_DIR = "data/raw"
OUTPUT_DIR = "data/clients"
N_CLIENTS = 3


def load_all_csvs(raw_dir):
    """Load and concatenate all CICIDS2017 daily CSVs."""
    csv_files = glob.glob(os.path.join(raw_dir, "*.csv"))
    print(f"Found {len(csv_files)} CSV files:")
    for f in csv_files:
        print(f"  - {os.path.basename(f)}")

    dfs = []
    for f in csv_files:
        print(f"Loading {os.path.basename(f)}...")
        df = pd.read_csv(f, low_memory=False)
        # Strip leading/trailing whitespace from column names
        # (CICIDS2017 files have columns like " Label", " Destination Port")
        df.columns = df.columns.str.strip()
        dfs.append(df)

    combined = pd.concat(dfs, ignore_index=True)
    print(f"\nCombined shape: {combined.shape}")
    return combined


def clean_data(df, label_col="Label"):
    """Handle inf/nan values, drop duplicate rows."""
    print("Cleaning data...")

    # Replace inf values (common in Flow Bytes/s, Flow Packets/s columns)
    df = df.replace([np.inf, -np.inf], np.nan)

    before = len(df)
    df = df.dropna()
    after = len(df)
    print(f"Dropped {before - after} rows with NaN/inf values ({after} remaining)")

    # Drop exact duplicate rows
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    print(f"Dropped {before - after} duplicate rows ({after} remaining)")

    print("\nLabel distribution:")
    print(df[label_col].value_counts())

    return df


def encode_and_scale(df, label_col="Label"):
    """Encode labels to integers, scale features to zero mean/unit variance."""
    le = LabelEncoder()
    y = le.fit_transform(df[label_col])

    print("\nLabel encoding map:")
    for i, cls in enumerate(le.classes_):
        print(f"  {i} -> {cls}")

    X = df.drop(columns=[label_col])

    # Some columns may be non-numeric (rare, but happens with malformed rows) — force numeric
    X = X.apply(pd.to_numeric, errors="coerce")
    X = X.fillna(0)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, le, scaler, X.columns.tolist()


def split_for_clients(X, y, n_clients, out_dir):
    """Split data into N shards to simulate federated clients."""
    os.makedirs(out_dir, exist_ok=True)

    # Shuffle before splitting so each client gets a mix of classes
    rng = np.random.default_rng(seed=42)
    indices = rng.permutation(len(X))
    X, y = X[indices], y[indices]

    shard_indices = np.array_split(np.arange(len(X)), n_clients)

    for i, idx in enumerate(shard_indices):
        np.save(os.path.join(out_dir, f"client{i}_X.npy"), X[idx])
        np.save(os.path.join(out_dir, f"client{i}_y.npy"), y[idx])
        print(f"Client {i}: {len(idx)} samples saved")


if __name__ == "__main__":
    df = load_all_csvs(RAW_DATA_DIR)
    df = clean_data(df)
    X, y, label_encoder, scaler, feature_names = encode_and_scale(df)

    print(f"\nFinal feature matrix shape: {X.shape}")
    print(f"Number of classes: {len(label_encoder.classes_)}")

    split_for_clients(X, y, N_CLIENTS, OUTPUT_DIR)

    # Save label encoder classes and feature names for later use (RAG/LLM explanation stage
    # needs to map predicted class index back to attack name)
    np.save(os.path.join(OUTPUT_DIR, "label_classes.npy"), label_encoder.classes_)
    with open(os.path.join(OUTPUT_DIR, "feature_names.txt"), "w") as f:
        f.write("\n".join(feature_names))

    print("\nPreprocessing complete.")