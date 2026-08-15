

# FedSentry

### Federated Learning-Based Intelligent Intrusion Detection & Security Operations Platform

FedSentry is an AI-powered cybersecurity platform that combines **Federated Learning, Deep Learning, Real-Time Intrusion Detection, Threat Intelligence, RAG, LLMs, and MITRE ATT&CK** into a unified SOC-oriented system.

The system detects network attacks while enabling distributed model training without requiring raw client datasets to be centralized.

---

## 🚀 Key Features

- Federated Learning with Flower
- Multiclass Network Intrusion Detection
- 78 network traffic features
- 15 CICIDS2017 attack classes
- PyTorch MLP-based IDS
- Class-weighted training for imbalanced data
- Real-time network traffic detection
- Threat Intelligence enrichment
- MITRE ATT&CK mapping
- RAG-based security knowledge retrieval
- LLM-powered attack analysis
- FastAPI backend
- React + TypeScript SOC dashboard
- PostgreSQL database
- WebSocket live monitoring
- Centralized vs Federated evaluation
- Inference latency benchmarking

---

## 🏗️ Architecture

```text
Network Traffic
      │
      ▼
Packet Capture
      │
      ▼
Flow Generation & Feature Extraction
      │
      ▼
78 Network Features
      │
      ▼
Federated IDS Model
      │
      ▼
Attack Prediction
      │
      ├──────────────┐
      ▼              ▼
    Alerts       Predictions
      │              │
      └───────┬──────┘
              ▼
          PostgreSQL
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
 Threat     RAG      MITRE
 Intel      + LLM    ATT&CK
      │       │        │
      └───────┼────────┘
              ▼
        SOC Dashboard

## 🧠 Federated Learning

FedSentry uses Flower + PyTorch for collaborative model training.
Client 1 ──┐
Client 2 ──┼──► Flower Server ──► Global Model
Client 3 ──┘
Configuration
Parameter
Value
Clients
3
Federated Rounds
10
Local Epochs
5
Batch Size
64
Learning Rate
0.001
Features
78
Classes
15
Model Parameters
55,823

📊 Dataset
The system uses a cleaned CICIDS2017-derived dataset.
Total Samples : 2,499,784
Training      : 1,999,827
Testing       : 499,957
Features      : 78
Classes       : 15
Attack Classes
BENIGN
Bot
DDoS
DoS GoldenEye
DoS Hulk
DoS Slowhttptest
DoS slowloris
FTP-Patator
Heartbleed
Infiltration
PortScan
SSH-Patator
Web Attack_Brute Force
Web Attack_Sql Injection
Web Attack_XSS

📈 Experimental Results
Federated Model
Metric
Score
Accuracy
90.16%
Weighted Precision
95.88%
Weighted Recall
90.16%
Weighted F1
92.32%
Macro F1
50.53%
Centralized Baseline
Metric
Score
Accuracy
91.18%
Weighted Precision
95.93%
Weighted Recall
91.18%
Weighted F1
92.92%
Macro F1
51.15%
The federated model achieves performance close to the centralized baseline while maintaining distributed training.


⚡ Inference Performance
Single-sample inference benchmark:
Mean Latency   : 1.77 ms
Median Latency : 1.41 ms
P95 Latency    : 2.71 ms
P99 Latency    : 5.59 ms

🤖 AI Security Layer
The planned AI security layer combines:
Security Alert
      │
      ▼
Threat Intelligence
      │
      ▼
MITRE ATT&CK Mapping
      │
      ▼
RAG Retrieval
      │
      ▼
LLM Analysis
      │
      ▼
Security Explanation
      │
      ▼
Recommended Response

The system can provide:
Attack explanation
Threat context
MITRE ATT&CK techniques
IOC enrichment
Risk analysis
Recommended mitigation
Incident summaries

🛠️ Technology Stack
Backend
Python
FastAPI
PostgreSQL
SQLAlchemy
Machine Learning
PyTorch
Flower
Scikit-learn
Pandas
NumPy
AI
RAG
FAISS
Sentence Transformers
LLM
Frontend
React
TypeScript
Tailwind CSS
Vite
Security
Threat Intelligence
MITRE ATT&CK
IOC analysis
Real-time monitoring

📁 Project Structure
Intrusion-Detection-System/
│
├── backend/
│   ├── federated/
│   ├── models/
│   ├── results/
│   ├── datasets/
│   ├── routes/
│   ├── services/
│   └── main.py
│
├── frontend/
│   └── src/
│
├── docs/
├── requirements.txt
└── README.md

⚙️ Installation

Clone
git clone https://github.com/harshakolachala/Intrusion-Detection-System.git

cd Intrusion-Detection-System
Backend
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
Backend:
http://127.0.0.1:8000
Frontend
cd frontend

npm install
npm run dev
Frontend:
http://localhost:5173
🔬 Federated Training

Start the Flower server:
cd backend
python -m federated.server
Then start three clients in separate terminals:
python -m federated.client 0
python -m federated.client 1
python -m federated.client 2

📁 Experiment Results
Important experimental results are stored in:
backend/results/
Including:
final_metrics.json
classification_report.txt
confusion_matrix.csv
per_class_metrics.csv
convergence.csv
convergence.png
inference_latency.json
centralized_metrics.json
federated_vs_centralized.csv

🔐 Security & Privacy
Federated Learning keeps client training data local and shares model updates rather than raw datasets.
Future production hardening includes:
Secure aggregation
Differential privacy
Client authentication
Model poisoning protection
Role-based access control
Audit logging
API rate limiting
Secure secret management

🎯 Future Work
Production-grade RAG pipeline
LLM security analyst
Advanced Threat Intelligence
MITRE ATT&CK automation
Multi-tenant architecture
SIEM integration
Docker deployment
CI/CD
Cloud deployment
Kubernetes scaling
Advanced incident response automation

👥 Team
Developed as a collaborative cybersecurity research project.

The project combines:
Federated Learning + Intrusion Detection + Threat Intelligence + Generative AI + SOC Automation

📄 License
Developed for academic, research, educational, and authorized cybersecurity purposes.

This is the version I would actually put on the **GitHub main page**. The detailed architecture, experiment methodology, confusion-matrix analysis, and IEEE-paper material should go into `docs/` instead of making the README huge. 
