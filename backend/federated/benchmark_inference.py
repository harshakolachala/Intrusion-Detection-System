import json
import os
import time
import numpy as np

from federated.predict import Predictor
from federated.config import INPUT_SIZE

RESULTS_DIR = "results"
OUTPUT_PATH = os.path.join(
    RESULTS_DIR,
    "inference_latency.json"
)

os.makedirs(RESULTS_DIR, exist_ok=True)

print("=" * 70)
print("SINGLE-SAMPLE INFERENCE LATENCY BENCHMARK")
print("=" * 70)

predictor = Predictor()

# Deterministic synthetic feature vector.
# This benchmark measures model inference overhead,
# not classification quality.
sample = [0.0] * INPUT_SIZE

# Warm-up
for _ in range(20):
    predictor.predict(sample)

# Benchmark
iterations = 1000
latencies_ms = []

for _ in range(iterations):

    start = time.perf_counter()

    predictor.predict(sample)

    end = time.perf_counter()

    latencies_ms.append(
        (end - start) * 1000
    )

latencies_ms = np.asarray(
    latencies_ms
)

result = {
    "iterations": iterations,
    "input_features": INPUT_SIZE,
    "mean_latency_ms": float(
        np.mean(latencies_ms)
    ),
    "median_latency_ms": float(
        np.median(latencies_ms)
    ),
    "p95_latency_ms": float(
        np.percentile(latencies_ms, 95)
    ),
    "p99_latency_ms": float(
        np.percentile(latencies_ms, 99)
    ),
    "min_latency_ms": float(
        np.min(latencies_ms)
    ),
    "max_latency_ms": float(
        np.max(latencies_ms)
    )
}

with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        result,
        file,
        indent=4
    )

print("\nResults")
print("-" * 70)

for key, value in result.items():
    print(f"{key}: {value}")

print(
    f"\nSaved: {OUTPUT_PATH}"
)