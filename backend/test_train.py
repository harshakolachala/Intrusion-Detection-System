from federated.dataset import IDSDataset
from federated.model import MLPIDS
from federated.train import train_local_model

# Load dataset
dataset = IDSDataset(
    development=True,
    sample_size=100000
)

client_loaders, test_loader = dataset.create_clients()

# Create model
model = MLPIDS(
    input_size=78,
    num_classes=2
)

# Train model on Client 1
model = train_local_model(
    model=model,
    train_loader=client_loaders[0],
    epochs=2,
    learning_rate=0.001
)

print("\nTraining completed successfully!")