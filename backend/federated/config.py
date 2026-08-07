"""
Flower Configuration
"""

# -------------------------------------------------------
# Flower Server
# -------------------------------------------------------

SERVER_ADDRESS = "127.0.0.1:9090"

# -------------------------------------------------------
# Federated Learning
# -------------------------------------------------------

NUM_CLIENTS = 3
NUM_ROUNDS = 10
LOCAL_EPOCHS = 5

# -------------------------------------------------------
# Training
# -------------------------------------------------------

BATCH_SIZE = 64
LEARNING_RATE = 0.001

# -------------------------------------------------------
# Dataset
# -------------------------------------------------------

INPUT_SIZE = 78

# CICIDS2017 Classes
# 0  - BENIGN
# 1  - Bot
# 2  - DDoS
# 3  - DoS GoldenEye
# 4  - DoS Hulk
# 5  - DoS Slowhttptest
# 6  - DoS slowloris
# 7  - FTP-Patator
# 8  - Heartbleed
# 9  - Infiltration
# 10 - PortScan
# 11 - SSH-Patator
# 12 - Web Attack_Brute Force
# 13 - Web Attack_Sql Injection
# 14 - Web Attack_XSS

NUM_CLASSES = 15

# -------------------------------------------------------
# Paths
# -------------------------------------------------------

MODEL_PATH = "models/global_model.pth"

DATASET_PATH = "datasets/combinenew.csv"

SCALER_PATH = "federated/scaler.pkl"

LABEL_MAPPING_PATH = "federated/label_mapping.json"

# -------------------------------------------------------
# Device
# -------------------------------------------------------

DEVICE = "cpu"