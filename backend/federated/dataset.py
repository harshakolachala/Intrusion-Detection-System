import os
import json
import pandas as pd
import numpy as np
import torch

from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler


class IDSDataset:
    """
    Dataset class for Federated Intrusion Detection
    """

    def __init__(
        self,
        csv_path="datasets/combinenew.csv",
        num_clients=3,
        test_size=0.2,
        random_state=42,
        development=True,
        sample_size=100000,
    ):

        self.csv_path = csv_path
        self.num_clients = num_clients
        self.test_size = test_size
        self.random_state = random_state
        self.development = development
        self.sample_size = sample_size

        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()

    # -------------------------------------------------------
    # Load Dataset
    # -------------------------------------------------------

    def load_dataset(self):

        print("Loading dataset...")

        df = pd.read_csv(
            self.csv_path,
            low_memory=False,
        )

        # Remove extra spaces
        df.columns = df.columns.str.strip()

        # Remove rows with missing labels
        df.dropna(subset=[df.columns[-1]], inplace=True)

        # Development mode: Stratified sampling
        if self.development:

            df, _ = train_test_split(
                df,
                train_size=self.sample_size,
                random_state=self.random_state,
                stratify=df.iloc[:, -1],
            )

        print(f"Dataset Loaded : {df.shape}")

        return df

    # -------------------------------------------------------
    # Clean Dataset
    # -------------------------------------------------------

    def clean_dataset(self, df):

        print("Cleaning dataset...")

        df.columns = df.columns.str.strip()

        # Convert Destination Port to numeric
        if "Destination Port" in df.columns:
            df["Destination Port"] = pd.to_numeric(
                df["Destination Port"],
                errors="coerce",
            )

        # Remove duplicate rows
        df.drop_duplicates(inplace=True)

        # Replace infinity
        df.replace([np.inf, -np.inf], np.nan, inplace=True)

        # Remove rows with missing labels
        df.dropna(subset=[df.columns[-1]], inplace=True)

        # Convert every feature to numeric
        feature_columns = df.columns[:-1]

        df[feature_columns] = df[feature_columns].apply(
            pd.to_numeric,
            errors="coerce",
        )

        # Fill missing feature values
        df[feature_columns] = df[feature_columns].fillna(0)

        return df

    # -------------------------------------------------------
    # Preprocess Dataset
    # -------------------------------------------------------

    def preprocess(self):

        df = self.load_dataset()

        df = self.clean_dataset(df)

        X = df.iloc[:, :-1]

        y = df.iloc[:, -1].astype(str)

        # Encode attack labels
        y = self.label_encoder.fit_transform(y)

        # Save label mapping
        label_mapping = {
            str(i): label
            for i, label in enumerate(
                self.label_encoder.classes_
            )
        }

        os.makedirs("federated", exist_ok=True)

        with open(
            "federated/label_mapping.json",
            "w",
            encoding="utf-8",
        ) as f:
            json.dump(
                label_mapping,
                f,
                indent=4,
            )

        # Standardize features
        X = self.scaler.fit_transform(X.values)

        return X, y

    # -------------------------------------------------------
    # Train Test Split
    # -------------------------------------------------------

    def train_test_split_dataset(self):

        X, y = self.preprocess()

        return train_test_split(
            X,
            y,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=y,
        )

    # -------------------------------------------------------
    # Client Partition
    # -------------------------------------------------------

    def create_clients(self):

        X_train, X_test, y_train, y_test = self.train_test_split_dataset()

        # Shuffle training data
        indices = np.random.permutation(len(X_train))

        X_train = X_train[indices]
        y_train = y_train[indices]

        client_size = len(X_train) // self.num_clients

        clients = []

        for i in range(self.num_clients):

            start = i * client_size

            if i == self.num_clients - 1:
                end = len(X_train)
            else:
                end = start + client_size

            X_client = torch.tensor(
                X_train[start:end],
                dtype=torch.float32,
            )

            y_client = torch.tensor(
                y_train[start:end],
                dtype=torch.long,
            )

            clients.append(
                TensorDataset(
                    X_client,
                    y_client,
                )
            )

        X_test = torch.tensor(
            X_test,
            dtype=torch.float32,
        )

        y_test = torch.tensor(
            y_test,
            dtype=torch.long,
        )

        test_dataset = TensorDataset(
            X_test,
            y_test,
        )

        client_loaders = [
            DataLoader(
                client,
                batch_size=64,
                shuffle=True,
            )
            for client in clients
        ]

        test_loader = DataLoader(
            test_dataset,
            batch_size=64,
            shuffle=False,
        )

        return client_loaders, test_loader

    # -------------------------------------------------------
    # Information
    # -------------------------------------------------------

    def get_information(self):

        X, y = self.preprocess()

        print("\nDataset Information")
        print("--------------------------")
        print("Samples :", len(X))
        print("Features :", X.shape[1])
        print("Classes :", len(np.unique(y)))
        print("--------------------------")

        print("\nDetected Classes")
        print("--------------------------")

        for i, label in enumerate(self.label_encoder.classes_):
            print(f"{i:2d} -> {label}")

        print("--------------------------")