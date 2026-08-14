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
        -> Optional development sampling
        -> Label encoding
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

    # =======================================================
    # Load Dataset
    # =======================================================

    def load_dataset(self):

        print("=" * 60)
        print("Loading Dataset")
        print("=" * 60)

        print(f"Dataset Path : {self.csv_path}")

        df = pd.read_csv(
            self.csv_path,
            low_memory=False,
        )

        # ---------------------------------------------------
        # Clean column names
        # ---------------------------------------------------

        df.columns = df.columns.str.strip()

        label_column = df.columns[-1]

        # ---------------------------------------------------
        # Remove rows with missing labels
        # ---------------------------------------------------

        before = len(df)

        df.dropna(
            subset=[label_column],
            inplace=True,
        )

        print(
            f"Rows Removed - Missing Labels : "
            f"{before - len(df)}"
        )

        # ===================================================
        # INITIAL DATA CLEANING
        # ===================================================

        print("\nInitial Dataset Cleaning...")

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
        # Remove rows with missing labels
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
        # Replace invalid feature values
        # ---------------------------------------------------

        df[feature_columns] = df[
            feature_columns
        ].replace(
            [np.inf, -np.inf],
            np.nan,
        )

        # ---------------------------------------------------
        # Fill missing feature values
        # ---------------------------------------------------

        df[feature_columns] = df[
            feature_columns
        ].fillna(0)

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

        # ===================================================
        # CLASS DISTRIBUTION AFTER CLEANING
        # ===================================================

        class_counts = df[
            label_column
        ].value_counts()

        print(
            "\nClass Distribution After Cleaning"
        )

        print("-" * 60)

        print(class_counts)

        # ===================================================
        # DEVELOPMENT MODE
        # ===================================================

        if self.development:

            print(
                f"\nDevelopment Mode Enabled "
                f"| Sample Size : {self.sample_size}"
            )

            # ------------------------------------------------
            # If requested sample is >= complete dataset
            # ------------------------------------------------

            if self.sample_size >= len(df):

                print(
                    "Requested sample size is greater than "
                    "or equal to the cleaned dataset size."
                )

                print(
                    "Using complete cleaned dataset."
                )

            else:

                print(
                    "\nCreating protected development sample..."
                )

                rng = np.random.default_rng(
                    self.random_state
                )

                # ------------------------------------------------
                # Minimum samples retained for every class
                # ------------------------------------------------
                #
                # This prevents rare classes such as Heartbleed
                # from disappearing from the development sample.
                #
                # 5 is sufficient for the later stratified
                # train/test split.
                # ------------------------------------------------

                min_per_class = 5

                selected_indices = []

                # ------------------------------------------------
                # Reserve minimum samples for every class
                # ------------------------------------------------

                for label in class_counts.index:

                    class_indices = df.index[
                        df[label_column] == label
                    ].to_numpy()

                    if len(class_indices) < min_per_class:

                        raise ValueError(
                            f"Class '{label}' contains only "
                            f"{len(class_indices)} samples. "
                            f"At least {min_per_class} are "
                            "required for development mode."
                        )

                    selected = rng.choice(
                        class_indices,
                        size=min_per_class,
                        replace=False,
                    )

                    selected_indices.extend(
                        selected.tolist()
                    )

                # ------------------------------------------------
                # Calculate remaining samples
                # ------------------------------------------------

                remaining_needed = (
                    self.sample_size
                    - len(selected_indices)
                )

                if remaining_needed < 0:

                    raise ValueError(
                        "sample_size is too small to preserve "
                        "all classes."
                    )

                # ------------------------------------------------
                # Remaining available rows
                # ------------------------------------------------

                remaining_indices = np.setdiff1d(
                    df.index.to_numpy(),
                    np.array(selected_indices),
                    assume_unique=False,
                )

                # ------------------------------------------------
                # Randomly select remaining rows
                # ------------------------------------------------

                additional_indices = rng.choice(
                    remaining_indices,
                    size=remaining_needed,
                    replace=False,
                )

                selected_indices.extend(
                    additional_indices.tolist()
                )

                # ------------------------------------------------
                # Create development dataset
                # ------------------------------------------------

                df = df.loc[
                    selected_indices
                ].copy()

                # ------------------------------------------------
                # Shuffle development dataset
                # ------------------------------------------------

                df = df.sample(
                    frac=1,
                    random_state=self.random_state,
                ).reset_index(
                    drop=True
                )

                print(
                    "\nProtected development sampling completed."
                )

        else:

            # ===================================================
            # FINAL MODE
            # ===================================================

            print(
                "\nFinal Mode Enabled"
            )

            print(
                "Using complete cleaned dataset."
            )

        # ===================================================
        # FINAL DATASET INFORMATION
        # ===================================================

        print(
            f"\nFinal Dataset Shape : {df.shape}"
        )

        final_counts = df[
            label_column
        ].value_counts()

        print(
            "\nFinal Class Distribution"
        )

        print("-" * 60)

        print(final_counts)

        # ===================================================
        # VALIDATE CLASS COUNTS
        # ===================================================

        insufficient_classes = final_counts[
            final_counts < 2
        ]

        if len(insufficient_classes) > 0:

            print(
                "\nERROR: Stratified train/test split "
                "cannot be performed."
            )

            print(
                "Classes with fewer than 2 samples:"
            )

            print(
                insufficient_classes
            )

            raise ValueError(
                "At least one class has fewer than "
                "2 samples after dataset preparation."
            )

        return df

    # =======================================================
    # Clean Dataset
    # =======================================================

    def clean_dataset(self, df):

        """
        Compatibility method.

        load_dataset() already performs the complete
        cleaning pipeline, so preprocess() does not call
        this method again.
        """

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
        # Remove missing labels
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
        # Replace invalid values
        # ---------------------------------------------------

        df[feature_columns] = df[
            feature_columns
        ].replace(
            [np.inf, -np.inf],
            np.nan,
        )

        # ---------------------------------------------------
        # Fill missing values
        # ---------------------------------------------------

        df[feature_columns] = df[
            feature_columns
        ].fillna(0)

        print(
            f"Clean Dataset Shape : {df.shape}"
        )

        print(
            f"Features : {len(feature_columns)}"
        )

        print(
            f"Classes : "
            f"{df[label_column].nunique()}"
        )

        return df

    # =======================================================
    # Prepare Train/Test Data
    # =======================================================

    def preprocess(self):

        df = self.load_dataset()

        # IMPORTANT:
        # Do not call clean_dataset() here.
        # load_dataset() has already cleaned the data.

        label_column = df.columns[-1]

        # ---------------------------------------------------
        # Separate features and labels
        # ---------------------------------------------------

        X = df.drop(
            columns=[label_column]
        )

        y = df[
            label_column
        ].astype(str)

        # ===================================================
        # Encode Labels
        # ===================================================

        y_encoded = self.label_encoder.fit_transform(
            y
        )

        # ---------------------------------------------------
        # Create label mapping
        # ---------------------------------------------------

        self.label_mapping = {
            str(index): label
            for index, label in enumerate(
                self.label_encoder.classes_
            )
        }

        # ---------------------------------------------------
        # Save label mapping
        # ---------------------------------------------------

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

        print(
            "\nLabel Mapping"
        )

        print("-" * 60)

        for index, label in enumerate(
            self.label_encoder.classes_
        ):

            print(
                f"{index:2d} -> {label}"
            )

        # ===================================================
        # TRAIN / TEST SPLIT
        # ===================================================

        print(
            "\nCreating stratified train/test split..."
        )

        # ---------------------------------------------------
        # Check class counts
        # ---------------------------------------------------

        encoded_counts = pd.Series(
            y_encoded
        ).value_counts()

        if encoded_counts.min() < 2:

            problematic = encoded_counts[
                encoded_counts < 2
            ]

            raise ValueError(
                "Cannot perform stratified train/test "
                "split because some classes have fewer "
                f"than 2 samples: "
                f"{problematic.to_dict()}"
            )

        # ---------------------------------------------------
        # Stratified 80/20 split
        # ---------------------------------------------------

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

        # ===================================================
        # STANDARD SCALING
        # ===================================================

        print(
            "\nFitting StandardScaler "
            "on training data only..."
        )

        # IMPORTANT:
        # Fit scaler ONLY on training data.
        # This prevents test-data leakage.

        X_train = self.scaler.fit_transform(
            X_train
        )

        X_test = self.scaler.transform(
            X_test
        )

        print(
            "Scaling completed."
        )

        return (
            X_train,
            X_test,
            y_train,
            y_test,
        )

    # =======================================================
    # Create Federated Clients
    # =======================================================

    def create_clients(self):

        (
            X_train,
            X_test,
            y_train,
            y_test,
        ) = self.preprocess()

        print(
            "\n" + "=" * 60
        )

        print(
            "Creating Federated Clients"
        )

        print(
            "=" * 60
        )

        # ===================================================
        # Shuffle Training Data
        # ===================================================

        rng = np.random.default_rng(
            self.random_state
        )

        indices = rng.permutation(
            len(X_train)
        )

        X_train = X_train[
            indices
        ]

        y_train = y_train[
            indices
        ]

        # ===================================================
        # Partition Training Data
        # ===================================================

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

            # ------------------------------------------------
            # Convert features to tensors
            # ------------------------------------------------

            X_client = torch.tensor(
                X_client,
                dtype=torch.float32,
            )

            # ------------------------------------------------
            # Convert labels to tensors
            # ------------------------------------------------

            y_client = torch.tensor(
                y_client,
                dtype=torch.long,
            )

            # ------------------------------------------------
            # Create TensorDataset
            # ------------------------------------------------

            dataset = TensorDataset(
                X_client,
                y_client,
            )

            clients.append(
                dataset
            )

        # ===================================================
        # Test Dataset
        # ===================================================

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

        # ===================================================
        # Client DataLoaders
        # ===================================================

        client_loaders = [

            DataLoader(
                client,
                batch_size=self.batch_size,
                shuffle=True,
            )

            for client in clients
        ]

        # ===================================================
        # Test DataLoader
        # ===================================================

        test_loader = DataLoader(
            test_dataset,
            batch_size=self.batch_size,
            shuffle=False,
        )

        # ===================================================
        # Final Information
        # ===================================================

        print(
            f"\nNumber of Clients : "
            f"{len(client_loaders)}"
        )

        print(
            f"Test Samples      : "
            f"{len(test_dataset)}"
        )

        print(
            "=" * 60
        )

        return (
            client_loaders,
            test_loader,
        )

    # =======================================================
    # Dataset Information
    # =======================================================

    def get_information(self):

        df = self.load_dataset()

        label_column = df.columns[-1]

        print(
            "\n" + "=" * 60
        )

        print(
            "Dataset Information"
        )

        print(
            "=" * 60
        )

        print(
            f"Samples  : {len(df)}"
        )

        print(
            f"Features : {len(df.columns) - 1}"
        )

        print(
            f"Classes  : "
            f"{df[label_column].nunique()}"
        )

        print(
            "\nClass Distribution"
        )

        print(
            "-" * 60
        )

        print(
            df[label_column].value_counts()
        )

        print(
            "=" * 60
        )