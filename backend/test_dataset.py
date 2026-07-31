from federated.dataset import IDSDataset

dataset = IDSDataset(
    development=True,
    sample_size=100000
)

dataset.get_information()

clients, test_dataset = dataset.create_clients()

print("\nClient Information")

for i, client in enumerate(clients):

    print(f"Client {i+1}: {len(client)} samples")

print(f"\nTest Dataset: {len(test_dataset)} samples")