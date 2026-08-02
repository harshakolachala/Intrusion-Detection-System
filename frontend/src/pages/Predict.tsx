import { useState } from "react";
import { predictIntrusion } from "../services/api";

interface PredictionResponse {
  prediction: string;
  confidence: number;
}

function Predict() {
  const [features, setFeatures] = useState(
    Array(78).fill(0).join(", ")
  );

  const [result, setResult] = useState<PredictionResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handlePredict() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const featureArray = features
        .split(",")
        .map((x) => Number(x.trim()));

      if (featureArray.length !== 78) {
        setError("Exactly 78 features are required.");
        return;
      }

      if (featureArray.some(isNaN)) {
        setError("Features must contain only numeric values.");
        return;
      }

      const response = await predictIntrusion(featureArray);

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Prediction failed. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Intrusion Detection Prediction</h1>

      <p>
        Enter 78 comma-separated feature values to predict whether the
        network traffic is Normal or an Attack.
      </p>

      <textarea
        rows={10}
        style={{
          width: "100%",
          fontSize: "14px",
          padding: "10px",
        }}
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
      />

      <br />
      <br />

      <button
        onClick={handlePredict}
        disabled={loading}
      >
        {loading ? "Predicting..." : "Predict"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "25px",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <h2>Prediction Result</h2>

          <p>
            <strong>Prediction:</strong>{" "}
            {result.prediction}
          </p>

          <p>
            <strong>Confidence:</strong>{" "}
            {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default Predict;