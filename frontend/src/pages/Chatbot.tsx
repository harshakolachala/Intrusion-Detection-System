import { useState } from "react";

const MOCK_EXPLANATION =
  "This traffic was flagged as DDoS because it showed an abnormally high packet rate from a single source IP within a short time window, combined with a low payload variance typical of flooding attacks. The model assigned 94% confidence based on packet-rate and inter-arrival-time features.";

function Chatbot() {
  const [detectionId, setDetectionId] = useState("1");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleExplain() {
    setLoading(true);
    setExplanation(null);
    // Later: replace with getExplanation(detectionId) from services/api.ts
    setTimeout(() => {
      setExplanation(MOCK_EXPLANATION);
      setLoading(false);
    }, 600);
  }

  return (
    <div>
      <h1>Explanations</h1>
      <p style={{ color: "#6b7280" }}>Ask why a detection was flagged</p>

      <div className="card" style={{ marginTop: "1rem" }}>
        <label htmlFor="detectionId" style={{ display: "block", marginBottom: "0.5rem" }}>
          Detection ID
        </label>
        <input
          id="detectionId"
          value={detectionId}
          onChange={(e) => setDetectionId(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem", border: "1px solid #d1d5db", borderRadius: 6 }}
        />
        <button
          onClick={handleExplain}
          style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          Explain
        </button>
      </div>

      {loading && <p>Generating explanation...</p>}

      {explanation && (
        <div className="card">
          <strong>Explanation</strong>
          <p style={{ marginTop: "0.5rem", lineHeight: 1.6 }}>{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default Chatbot;