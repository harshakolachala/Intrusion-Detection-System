import os
import json
import numpy as np
import pandas as pd
import torch

from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler


class IDSDataset:
    """
    Dataset pipeline for Federated Intrusion Detection.

    Pipeline:
        CSV
        -> Cleaning
        -> Stratified train/test split
        -> Fit scaler on training data only
        -> Transform train/test
        -> Partition training data among FL clients
    """

    def __init__(
        self,
        csv_path="datasets/combinenew.csv",
        num_clients=3,
        test_size=0.2,
        random_state=42,
        development=False,
        sample_size=100000,
        batch_size=64,
    ):

        self.csv_path = csv_path
        self.num_clients = num_clients
        self.test_size = test_size
        self.random_state = random_state
        self.development = development
        self.sample_size = sample_size
        self.batch_size = batch_size

        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()

        self.label_mapping = {}

    # -------------------------------------------------------
    # Load Dataset
    # -------------------------------------------------------

    def load_dataset(self):

        print("=" * 60)
        print("Loading Dataset")
        print("=" * 60)

        print(f"Dataset Path : {self.csv_path}")

        df = pd.read_csv(
            self.csv_path,
            low_memory=False,
        )

        # Remove whitespace from column names
        df.columns = df.columns.str.strip()

        # Remove rows with missing labels
        label_column = df.columns[-1]

        df.dropna(
            subset=[label_column],
            inplace=True,
        )

        # ---------------------------------------------------
        # Development Mode
        # ---------------------------------------------------

        if self.development:

            print(
                f"Development Mode Enabled "
                f"| Sample Size : {self.sample_size}"
            )

            if self.sample_size < len(df):

                df, _ = train_test_split(
                    df,
                    train_size=self.sample_size,
                    random_state=self.random_state,
                    stratify=df[label_column],
                )

        else:

            print("Final Mode Enabled")
            print("Using complete dataset.")

        print(f"Dataset Shape : {df.shape}")

        return df

    # -------------------------------------------------------
    # Clean Dataset
    # -------------------------------------------------------

    def clean_dataset(self, df):

        print("\nCleaning Dataset...")

        df = df.copy()

        df.columns = df.columns.str.strip()

        label_column = df.columns[-1]

        # ---------------------------------------------------
        # Convert Destination Port
        # ---------------------------------------------------

        if "Destination Port" in df.columns:

            df["Destination Port"] = pd.to_numeric(
                df["Destination Port"],
                errors="coerce",
            )

        # ---------------------------------------------------
        # Remove duplicates
        # ---------------------------------------------------

        before = len(df)

        df.drop_duplicates(
            inplace=True
        )

        print(
            f"Duplicates Removed : "
            f"{before - len(df)}"
        )

        # ---------------------------------------------------
        # Replace infinity
        # ---------------------------------------------------

        df.replace(
            [np.inf, -np.inf],
            np.nan,
            inplace=True,
        )

        # ---------------------------------------------------
        # Remove rows without labels
        # ---------------------------------------------------

        df.dropna(
            subset=[label_column],
            inplace=True,
        )

        # ---------------------------------------------------
        # Feature columns
        # ---------------------------------------------------

        feature_columns = [
            column
            for column in df.columns
            if column != label_column
        ]

        # ---------------------------------------------------
        # Convert features to numeric
        # ---------------------------------------------------

        df[feature_columns] = df[
            feature_columns
        ].apply(
            pd.to_numeric,
            errors="coerce",
        )

        # ---------------------------------------------------
        # Replace missing feature values
        # ---------------------------------------------------

        df[feature_columns] = df[
            feature_columns
        ].replace(
            [np.inf, -np.inf],
            np.nan,
        )

        df[feature_columns] = df[
            feature_columns
        ].fillna(0)

        # ---------------------------------------------------
        # Final validation
        # ---------------------------------------------------

        print(
            f"Clean Dataset Shape : {df.shape}"
        )

        print(
            f"Features : {len(feature_columns)}"
        )

        print(
            f"Classes  : "
            f"{df[label_column].nunique()}"
        )

        return df

    # -------------------------------------------------------
    # Prepare Train/Test Data
    # -------------------------------------------------------

    def preprocess(self):

        df = self.load_dataset()

        df = self.clean_dataset(df)

        label_column = df.columns[-1]

        X = df.drop(
            columns=[label_column]
        )

        y = df[label_column].astype(str)

        # ---------------------------------------------------
        # Encode Labels
        # ---------------------------------------------------

        y_encoded = self.label_encoder.fit_transform(
            y
        )

        self.label_mapping = {
            str(index): label
            for index, label in enumerate(
                self.label_encoder.classes_
            )
        }

        os.makedirs(
            "federated",
            exist_ok=True,
        )

        with open(
            "federated/label_mapping.json",
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                self.label_mapping,
                file,
                indent=4,
            )

        print("\nLabel Mapping")

        for index, label in enumerate(
            self.label_encoder.classes_
        ):

            print(
                f"{index:2d} -> {label}"
            )

        # ---------------------------------------------------
        # Train/Test Split
        # ---------------------------------------------------

        print("\nCreating stratified train/test split...")

        X_train, X_test, y_train, y_test = train_test_split(

            X,
            y_encoded,

            test_size=self.test_size,

            random_state=self.random_state,

            stratify=y_encoded,
        )

        print(
            f"Training Samples : {len(X_train)}"
        )

        print(
            f"Testing Samples  : {len(X_test)}"
        )

        # ---------------------------------------------------
        # Fit scaler ONLY on training data
        # ---------------------------------------------------

        print(
            "\nFitting StandardScaler "
            "on training data only..."
        )

        X_train = self.scaler.fit_transform(
            X_train
        )

        X_test = self.scaler.transform(
            X_test
        )

        print("Scaling completed.")

        return (
            X_train,
            X_test,
            y_train,
            y_test,
        )

    # -------------------------------------------------------
    # Create Federated Clients
    # -------------------------------------------------------

    def create_clients(self):

        (
            X_train,
            X_test,
            y_train,
            y_test,
        ) = self.preprocess()

        print("\n" + "=" * 60)
        print("Creating Federated Clients")
        print("=" * 60)

        # ---------------------------------------------------
        # Shuffle training data
        # ---------------------------------------------------

        rng = np.random.default_rng(
            self.random_state
        )

        indices = rng.permutation(
            len(X_train)
        )

        X_train = X_train[indices]
        y_train = y_train[indices]

        # ---------------------------------------------------
        # Partition training data
        # ---------------------------------------------------

        client_indices = np.array_split(
            np.arange(len(X_train)),
            self.num_clients,
        )

        clients = []

        for client_id, indices in enumerate(
            client_indices
        ):

            X_client = X_train[
                indices
            ]

            y_client = y_train[
                indices
            ]

            print(
                f"Client {client_id} "
                f"| Samples : {len(X_client)}"
            )

            X_client = torch.tensor(
                X_client,
                dtype=torch.float32,
            )

            y_client = torch.tensor(
                y_client,
                dtype=torch.long,
            )

            dataset = TensorDataset(
                X_client,
                y_client,
            )

            clients.append(
                dataset
            )

        # ---------------------------------------------------
        # Test Dataset
        # ---------------------------------------------------

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

        # ---------------------------------------------------
        # DataLoaders
        # ---------------------------------------------------

        client_loaders = [

            DataLoader(
                client,
                batch_size=self.batch_size,
                shuffle=True,
            )

            for client in clients
        ]

        test_loader = DataLoader(
            test_dataset,
            batch_size=self.batch_size,
            shuffle=False,
        )

        print(
            f"\nNumber of Clients : "
            f"{len(client_loaders)}"
        )

        print(
            f"Test Samples      : "
            f"{len(test_dataset)}"
        )

        print("=" * 60)

        return (
            client_loaders,
            test_loader,
        )

    # -------------------------------------------------------
    # Dataset Information
    # -------------------------------------------------------

    def get_information(self):

        df = self.load_dataset()

        df = self.clean_dataset(df)

        label_column = df.columns[-1]

        print("\n" + "=" * 60)
        print("Dataset Information")
        print("=" * 60)

        print(
            f"Samples  : {len(df)}"
        )

        print(
            f"Features : {len(df.columns) - 1}"
        )

        print(
            f"Classes  : {df[label_column].nunique()}"
        )

        print("\nClass Distribution")
        print("-" * 60)

        print(
            df[label_column].value_counts()
        )

        print("=" * 60)