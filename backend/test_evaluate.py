from federated.dataset import IDSDataset
from federated.model import MLPIDS
from federated.train import train_local_model
from federated.evaluate import evaluate_model

print("Loading dataset...")

dataset = IDSDataset(
    development=True,
    sample_size=100000
)

client_loaders, test_loader = dataset.create_clients()

print("Creating model...")

model = MLPIDS(
    input_size=78,
    num_classes=2
)

print("Training...")

model = train_local_model(
    model,
    client_loaders[0],
    epochs=2
)

print("Evaluating...")

metrics = evaluate_model(
    model,
    test_loader
)

print("\nEvaluation Complete!")