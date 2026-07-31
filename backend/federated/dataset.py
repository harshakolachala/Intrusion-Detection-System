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
        sample_size=100000
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

        if self.development:

            df = pd.read_csv(
                self.csv_path,
                nrows=self.sample_size,
                low_memory=False
            )

        else:

            df = pd.read_csv(
                self.csv_path,
                low_memory=False
            )

        print(f"Dataset Loaded : {df.shape}")

        return df

    # -------------------------------------------------------
    # Clean Dataset
    # -------------------------------------------------------

    def clean_dataset(self, df):

        print("Cleaning dataset...")

        df.columns = df.columns.str.strip()

        df.drop_duplicates(inplace=True)

        df.replace([np.inf, -np.inf], np.nan, inplace=True)

        df.fillna(0, inplace=True)

        return df

    # -------------------------------------------------------
    # Preprocess Dataset
    # -------------------------------------------------------

    def preprocess(self):

        df = self.load_dataset()

        df = self.clean_dataset(df)

        X = df.iloc[:, :-1]

        y = df.iloc[:, -1]

        y = self.label_encoder.fit_transform(y)

        X = self.scaler.fit_transform(X)

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
            stratify=y
        )

    # -------------------------------------------------------
    # Client Partition
    # -------------------------------------------------------

    def create_clients(self):

        X_train, X_test, y_train, y_test = self.train_test_split_dataset()

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
                dtype=torch.float32
            )

            y_client = torch.tensor(
                y_train[start:end],
                dtype=torch.long
            )

            dataset = TensorDataset(
                X_client,
                y_client
            )

            clients.append(dataset)

        X_test = torch.tensor(
            X_test,
            dtype=torch.float32
        )

        y_test = torch.tensor(
            y_test,
            dtype=torch.long
        )

        test_dataset = TensorDataset(
            X_test,
            y_test
        )

        client_loaders = [
        DataLoader(client, batch_size=64, shuffle=True)
        for client in clients
        ]

        test_loader = DataLoader(
        test_dataset,
        batch_size=64,
        shuffle=False
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