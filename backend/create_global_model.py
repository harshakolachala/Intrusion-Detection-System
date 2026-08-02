from federated.model import MLPIDS, save_model
from federated.config import INPUT_SIZE, NUM_CLASSES, MODEL_PATH
import os

os.makedirs("models", exist_ok=True)

model = MLPIDS(
    input_size=INPUT_SIZE,
    num_classes=NUM_CLASSES
)

save_model(model, MODEL_PATH)

print(f"Global model saved to {MODEL_PATH}")