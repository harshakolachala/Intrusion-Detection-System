from federated.dataset import IDSDataset
import pandas as pd

# ----- Check labels in dataset -----
df = pd.read_csv("datasets/combinenew.csv")

print("\nUnique Labels:")
print(df.iloc[:, -1].unique())

print("\nTotal Classes:")
print(df.iloc[:, -1].nunique())

print("\nValue Counts:")
print(df.iloc[:, -1].value_counts())


dataset = IDSDataset(
    development=False
)

dataset.get_information()

clients, test_dataset = dataset.create_clients()

print("\nClient Information")

for i, client in enumerate(clients):
    print(f"Client {i+1}: {len(client)} samples")

print(f"\nTest Dataset: {len(test_dataset)} samples")