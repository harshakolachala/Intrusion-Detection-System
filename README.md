# FedSentry

### Federated Learning-Based Intelligent Intrusion Detection & Security Operations Platform

FedSentry is an AI-powered cybersecurity platform designed to provide intelligent, privacy-aware, and real-time network security monitoring. The platform combines **Federated Learning, Deep Learning, Intrusion Detection, Threat Intelligence, MITRE ATT&CK, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs)** into a unified SOC-oriented security platform.

FedSentry detects network attacks using a multiclass intrusion detection model, enriches security events with threat intelligence, maps detected attacks to MITRE ATT&CK techniques, and uses RAG and LLM-based analysis to provide security context, explanations, and recommended actions.

---

## 🚀 Key Features

- Federated Learning using Flower
- Privacy-aware distributed model training
- Multiclass Network Intrusion Detection
- 78 network traffic features
- 15 CICIDS2017-derived traffic classes
- PyTorch MLP-based IDS
- Class-weighted training for highly imbalanced data
- Real-time network traffic analysis
- Real-time security alerts
- Threat Intelligence enrichment
- IOC analysis
- MITRE ATT&CK technique mapping
- Retrieval-Augmented Generation (RAG)
- LLM-powered security analysis
- Security incident summarization
- Risk assessment
- Recommended mitigation actions
- FastAPI backend
- React + TypeScript SOC dashboard
- PostgreSQL-based security event storage
- WebSocket-based live monitoring
- Centralized vs Federated model comparison
- Confusion matrix analysis
- Per-class performance evaluation
- Model convergence analysis
- Inference latency benchmarking

---

## 🏗️ System Architecture

Network Traffic → Packet Capture → Flow Generation → Feature Extraction → 78 Network Features → Federated IDS Model → Attack Classification → Alert Generation → PostgreSQL → Threat Intelligence → MITRE ATT&CK → RAG Retrieval → LLM Security Analysis → SOC Dashboard

The platform is designed around a layered security architecture:

**Detection Layer:** Network traffic processing and ML-based intrusion detection.

**Federated Learning Layer:** Distributed training across multiple clients without directly centralizing client training data.

**Intelligence Layer:** Threat Intelligence, IOC enrichment, and MITRE ATT&CK mapping.

**Generative AI Layer:** RAG retrieves relevant security knowledge and an LLM generates contextual security analysis.

**SOC Layer:** The React dashboard provides real-time alerts, attack statistics, threat context, model predictions, and security recommendations.

---

## 🧠 Federated Learning

FedSentry uses **Flower and PyTorch** for collaborative intrusion detection model training.

Client 1 ──┐  
Client 2 ──┼──► Flower Server ──► FedAvg Aggregation ──► Global Model  
Client 3 ──┘

Each client receives the current global model, performs local training using its own data partition, and sends the updated model parameters back to the Flower server.

The server aggregates the client updates using **Federated Averaging (FedAvg)** and produces the next global model.

### Federated Configuration

| Parameter | Value |
|---|---:|
| Clients | 3 |
| Federated Rounds | 10 |
| Local Epochs | 5 |
| Batch Size | 64 |
| Learning Rate | 0.001 |
| Input Features | 78 |
| Output Classes | 15 |
| Model Parameters | 55,823 |
| Aggregation | FedAvg |

---

## 🔒 Federated Privacy Model

FedSentry is designed to avoid directly transferring raw client training data to the central aggregation server.

The federated workflow is:

1. Initialize global IDS model.
2. Distribute the model to participating clients.
3. Train the model locally on each client.
4. Return model parameters to the federated server.
5. Aggregate client updates using FedAvg.
6. Generate a new global model.
7. Repeat for multiple federated rounds.
8. Evaluate the final global model on the common test set.

This architecture provides a foundation for privacy-preserving collaborative intrusion detection.

Production deployments can further introduce secure aggregation, differential privacy, client authentication, and malicious-client detection.

---

## 📊 Dataset

The system uses a cleaned **CICIDS2017-derived dataset** containing network traffic records representing benign and malicious activities.

| Property | Value |
|---|---:|
| Total Samples | 2,499,784 |
| Training Samples | 1,999,827 |
| Testing Samples | 499,957 |
| Features | 78 |
| Classes | 15 |

The dataset pipeline performs:

- Missing-label removal
- Duplicate removal
- Infinite-value handling
- Numeric feature conversion
- Missing feature handling
- Label encoding
- Stratified train/test splitting
- StandardScaler fitting on training data only
- Federated client partitioning

### Attack Classes

- BENIGN
- Bot
- DDoS
- DoS GoldenEye
- DoS Hulk
- DoS Slowhttptest
- DoS slowloris
- FTP-Patator
- Heartbleed
- Infiltration
- PortScan
- SSH-Patator
- Web Attack_Brute Force
- Web Attack_Sql Injection
- Web Attack_XSS

---

## 🧮 Machine Learning Model

FedSentry uses a fully connected **Multilayer Perceptron (MLP)** implemented using PyTorch.

### Model Architecture

78 Input Features → 256 Neurons → Batch Normalization → ReLU → Dropout → 128 Neurons → Batch Normalization → ReLU → Dropout → 15-Class Output

| Model Property | Value |
|---|---:|
| Input Features | 78 |
| Hidden Layer 1 | 256 |
| Hidden Layer 2 | 128 |
| Output Classes | 15 |
| Dropout | 0.3 |
| Parameters | 55,823 |
| Optimizer | Adam |
| Learning Rate | 0.001 |
| Loss | Class-Weighted Cross Entropy |

Class-weighted training is used to reduce the impact of severe class imbalance and improve detection of minority attack categories.

---

## 📈 Federated Experimental Results

The federated experiment was conducted using:

- 3 clients
- 10 federated rounds
- 5 local epochs per round
- 1,999,827 training samples
- 499,957 test samples
- 78 input features
- 15 output classes

### Final Federated Performance

| Metric | Score |
|---|---:|
| Accuracy | **90.16%** |
| Weighted Precision | **95.88%** |
| Weighted Recall | **90.16%** |
| Weighted F1 | **92.32%** |
| Macro Precision | **44.71%** |
| Macro Recall | **82.24%** |
| Macro F1 | **50.53%** |

The federated model reached its highest observed accuracy of approximately **91.01% during Round 7**, with a corresponding F1 score of approximately **92.92%**.

The final Round 10 model achieved **90.16% accuracy** and **92.32% weighted F1**.

---

## 🏢 Centralized Baseline

A centralized MLP model was trained using the same dataset split, model architecture, learning rate, batch size, and number of epochs to provide a baseline for evaluating the federated approach.

### Centralized Performance

| Metric | Score |
|---|---:|
| Accuracy | **91.18%** |
| Weighted Precision | **95.93%** |
| Weighted Recall | **91.18%** |
| Weighted F1 | **92.92%** |
| Macro Precision | **49.34%** |
| Macro Recall | **84.93%** |
| Macro F1 | **51.15%** |

### Federated vs Centralized

| Metric | Federated | Centralized |
|---|---:|---:|
| Accuracy | 90.16% | 91.18% |
| Weighted Precision | 95.88% | 95.93% |
| Weighted Recall | 90.16% | 91.18% |
| Weighted F1 | 92.32% | 92.92% |
| Macro Precision | 44.71% | 49.34% |
| Macro Recall | 82.24% | 84.93% |
| Macro F1 | 50.53% | 51.15% |

The results show that the federated model performs close to the centralized baseline while providing the architectural advantage of distributed training.

---

## ⚡ Inference Performance

Single-sample inference was benchmarked over 1,000 iterations using the trained global model.

| Metric | Result |
|---|---:|
| Mean Latency | **1.77 ms** |
| Median Latency | **1.41 ms** |
| P95 Latency | **2.71 ms** |
| P99 Latency | **5.59 ms** |
| Minimum Latency | **1.06 ms** |
| Maximum Latency | **9.84 ms** |

The model is lightweight with only **55,823 parameters**, enabling low-latency inference suitable for real-time security monitoring scenarios.

---

## 🔍 Confusion Matrix Analysis

The final model evaluation includes a complete multiclass confusion matrix and per-class performance analysis.

The analysis identifies the most frequent misclassification patterns and helps evaluate the effect of class imbalance.

Major observed misclassification patterns include:

- BENIGN → Bot
- BENIGN → PortScan
- BENIGN → DoS Hulk
- BENIGN → SSH-Patator
- BENIGN → DDoS
- BENIGN → Web Attack_Brute Force
- BENIGN → DoS slowloris
- BENIGN → FTP-Patator
- BENIGN → DoS GoldenEye
- BENIGN → DoS Slowhttptest

Per-class precision, recall, F1-score, and support are stored as experimental artifacts for detailed analysis.

---

## 🤖 AI Security Layer

FedSentry extends traditional IDS classification with an intelligent security analysis layer.

Security Alert → IOC Extraction → Threat Intelligence → MITRE ATT&CK Mapping → RAG Retrieval → LLM Analysis → Risk Assessment → Recommended Response

The AI layer is designed to transform a raw ML prediction into an analyst-friendly security incident.

For example, instead of only reporting:

**"PortScan detected"**

the platform can provide:

- Detected attack type
- Confidence score
- Source and destination information
- Relevant IOC information
- Threat Intelligence context
- MITRE ATT&CK technique
- Related security knowledge
- Attack explanation
- Severity assessment
- Recommended mitigation
- Incident summary

---

## 🌐 Threat Intelligence

The Threat Intelligence layer is designed to enrich detected security events using external and internal intelligence sources.

Potential intelligence sources include:

- IP reputation
- Domain reputation
- Hash intelligence
- URL intelligence
- IOC feeds
- Malware intelligence
- Vulnerability information
- Security advisories
- Threat actor information

The enrichment pipeline associates detected indicators with relevant threat context before passing the information to the RAG and LLM layers.

---

## 🧩 MITRE ATT&CK Integration

Detected attacks can be mapped to relevant **MITRE ATT&CK techniques and tactics**.

The mapping layer helps security analysts understand:

- What type of attack occurred
- Which ATT&CK technique is relevant
- Which tactic the activity belongs to
- What the attacker may be attempting to achieve
- What defensive action may be appropriate

This allows FedSentry to move beyond simple classification toward security-oriented attack interpretation.

---

## 📚 Retrieval-Augmented Generation

The RAG layer provides the LLM with relevant cybersecurity knowledge before generating an answer.

The RAG pipeline is designed as:

Security Event → Query Generation → Embedding → Vector Search → Relevant Documents → Context Construction → LLM → Security Analysis

Potential knowledge sources include:

- MITRE ATT&CK documentation
- Security advisories
- Threat Intelligence reports
- Vulnerability information
- Incident response procedures
- Internal SOC documentation
- Security playbooks

The retrieval layer helps reduce unsupported LLM responses by grounding the generated analysis in retrieved security information.

---

## 🧠 LLM Security Analyst

The LLM layer acts as an intelligent security analyst interface.

It can generate:

- Attack explanations
- Incident summaries
- Risk assessments
- Threat context
- MITRE ATT&CK explanations
- IOC interpretation
- Recommended mitigations
- Investigation suggestions
- Analyst-friendly reports

The LLM is intended to assist security analysts rather than replace deterministic detection and security controls.

---

## 📡 Real-Time Detection Pipeline

The real-time security pipeline is designed to process network activity continuously.

Network Interface → Packet Capture → Flow Construction → Feature Extraction → Feature Scaling → IDS Prediction → Confidence Score → Alert Generation → Threat Intelligence → MITRE Mapping → RAG/LLM Analysis → SOC Dashboard

This enables the platform to display security events as they are detected.

---

## 🖥️ SOC Dashboard

The frontend provides a SOC-oriented interface for security monitoring.

The dashboard is designed to provide:

- Security overview
- Real-time alerts
- Attack distribution
- Traffic statistics
- Detection confidence
- Severity levels
- Threat Intelligence information
- MITRE ATT&CK information
- Incident details
- Model performance
- Federated learning statistics
- Historical security events
- LLM-generated security analysis

---

## 🛠️ Technology Stack

### Backend

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Uvicorn

### Machine Learning

- PyTorch
- Flower
- Scikit-learn
- Pandas
- NumPy

### Federated Learning

- Flower
- FedAvg
- Distributed client training
- Global model aggregation

### Generative AI

- RAG
- FAISS
- Sentence Transformers
- LLM

### Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

### Security

- Threat Intelligence
- MITRE ATT&CK
- IOC Analysis
- Real-Time Monitoring
- Security Alerting

---

## 📁 Project Structure

Intrusion-Detection-System/  
├── backend/  
│   ├── federated/  
│   │   ├── client.py  
│   │   ├── server.py  
│   │   ├── strategy.py  
│   │   ├── dataset.py  
│   │   ├── model.py  
│   │   ├── train.py  
│   │   ├── evaluate.py  
│   │   ├── predict.py  
│   │   ├── config.py  
│   │   └── final_evaluation.py  
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

---

## ⚙️ Installation

### Clone Repository

    git clone https://github.com/harshakolachala/Intrusion-Detection-System.git
    cd Intrusion-Detection-System

### Backend Setup

    cd backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt

Start the FastAPI backend:

    uvicorn main:app --reload

Backend:

    http://127.0.0.1:8000

### Frontend Setup

Open another terminal:

    cd frontend
    npm install
    npm run dev

Frontend:

    http://localhost:5173

---

## 🔬 Running Federated Training

Start the Flower server:

    cd backend
    python -m federated.server

Start Client 0:

    python -m federated.client 0

Start Client 1:

    python -m federated.client 1

Start Client 2:

    python -m federated.client 2

The server waits for the three clients, distributes the global model, aggregates client updates, evaluates the global model, and stores round-level metrics.

---

## 📊 Experiment Artifacts

Experimental results are stored in `backend/results/`.

Important files include:

- `final_metrics.json`
- `classification_report.txt`
- `confusion_matrix.csv`
- `per_class_metrics.csv`
- `convergence.csv`
- `convergence.png`
- `federated_round_metrics.csv`
- `inference_latency.json`
- `confusion_matrix_analysis.json`
- `confusion_matrix_analysis.txt`
- `centralized_metrics.json`
- `centralized_classification_report.txt`
- `centralized_confusion_matrix.csv`
- `centralized_per_class_metrics.csv`
- `centralized_training_history.csv`
- `centralized_training_history.png`
- `federated_vs_centralized.csv`

These artifacts provide reproducible evidence for model performance, convergence, inference performance, confusion matrix analysis, centralized comparison, and per-class evaluation.

---

## 📌 Reproducibility

The experiment uses fixed configuration parameters and deterministic dataset splitting where applicable.

Key experiment parameters include:

- Random state: 42
- Number of clients: 3
- Federated rounds: 10
- Local epochs: 5
- Batch size: 64
- Learning rate: 0.001
- Input features: 78
- Number of classes: 15

The dataset preprocessing pipeline fits the StandardScaler using training data only to avoid test-data leakage.

---

## 🔐 Security & Privacy

FedSentry is designed for authorized cybersecurity monitoring and research.

Federated Learning enables participating clients to train locally and share model updates rather than directly sharing raw training data.

Recommended production security controls include:

- Secure aggregation
- Differential privacy
- Client authentication
- TLS communication
- Model poisoning detection
- Byzantine-resilient aggregation
- Role-based access control
- Audit logging
- API rate limiting
- Secure secret management
- Database encryption
- Input validation
- Network segmentation

---

## 🎯 Future Work

- Production-grade RAG pipeline
- Production Threat Intelligence integrations
- LLM security analyst
- Automated MITRE ATT&CK mapping
- Automated IOC extraction
- Automated incident response
- Security playbook integration
- SIEM integration
- SOAR integration
- Multi-tenant architecture
- Docker deployment
- CI/CD pipeline
- Cloud deployment
- Kubernetes scaling
- Secure aggregation
- Differential privacy
- Byzantine-resilient federated learning
- Advanced model monitoring

---

## 👥 Team

FedSentry is developed as a collaborative cybersecurity research project combining:

**Federated Learning + Intrusion Detection + Threat Intelligence + Generative AI + SOC Automation**

The project is structured to support collaborative development across machine learning, backend engineering, frontend/SOC development, and cybersecurity intelligence components.

---

## 📄 Research Contribution

FedSentry demonstrates the integration of distributed intrusion detection with an intelligent security operations workflow.

The experimental evaluation includes:

- Federated learning performance
- Centralized baseline comparison
- Multiclass intrusion detection
- Class imbalance handling
- Per-class evaluation
- Confusion matrix analysis
- Model convergence
- Inference latency
- Distributed client training
- AI-assisted security analysis architecture

These experiments provide the foundation for evaluating the feasibility of privacy-aware collaborative intrusion detection in an intelligent SOC environment.

---

## ⚠️ Disclaimer

FedSentry is developed for **academic research, education, authorized security testing, and defensive cybersecurity purposes**.

Network monitoring, packet capture, Threat Intelligence, and automated response components should only be deployed on systems and networks where the operator has appropriate authorization.

---

## 📄 License

Developed for academic, research, educational, and authorized cybersecurity purposes.
