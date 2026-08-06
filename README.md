# SentinelAI

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-2.x-red)
![Flower](https://img.shields.io/badge/Flower-Federated-orange)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

# SentinelAI
## Enterprise Federated Intrusion Detection System with Explainable AI

SentinelAI is an enterprise-grade Network Intrusion Detection System (NIDS) designed for real-time cyber threat detection using **Federated Learning**, **Deep Learning**, **FastAPI**, **PostgreSQL**, **React**, and future **LLM + Retrieval-Augmented Generation (RAG)** powered explainability.

Unlike traditional IDS solutions that rely on centralized training and static signatures, SentinelAI employs federated learning to collaboratively train intrusion detection models while preserving data privacy. The system captures live network traffic, generates bidirectional flows, extracts CICIDS2017-compatible features, performs real-time multiclass attack classification, stores predictions and alerts, and is designed to provide AI-generated attack explanations for SOC analysts.

---

# Key Highlights

- Enterprise Modular Architecture
- Real-Time Packet Capture
- Automatic Network Flow Generation
- CICIDS2017 Compatible Feature Extraction
- Federated Learning using Flower
- Multiclass Deep Learning IDS
- FastAPI REST APIs
- PostgreSQL Database
- JWT Authentication
- Prediction & Alert Management
- React + TypeScript Dashboard
- LLM + RAG Explainable AI (Upcoming)
- MITRE ATT&CK Mapping (Upcoming)
- Threat Intelligence Integration (Upcoming)

---

# Supported Attack Classes

The IDS is designed to classify CICIDS2017 traffic into multiple attack categories rather than binary Normal/Attack classification.

| Attack Category |
|----------------|
| Normal |
| PortScan |
| DDoS |
| DoS Hulk |
| DoS GoldenEye |
| DoS Slowloris |
| DoS SlowHTTPTest |
| Bot |
| FTP-Patator |
| SSH-Patator |
| Web Attack – Brute Force |
| Web Attack – SQL Injection |
| Web Attack – XSS |
| Heartbleed |
| Infiltration |

---

# Features

## Authentication

- JWT Authentication
- User Registration
- User Login
- Password Hashing (bcrypt)
- Protected APIs
- Role-Based Access Control

---

## Real-Time Detection Engine

- Live Packet Capture
- Continuous Packet Processing
- Thread-Safe Packet Queue
- Automatic Flow Generation
- Flow Timeout Management
- Bidirectional Flow Tracking
- Automatic Feature Extraction
- Data Preprocessing
- Real-Time Prediction
- Automatic Alert Generation
- Prediction Logging
- Engine Statistics API

---

## Federated Learning

SentinelAI uses Flower to enable decentralized collaborative model training.

Features include:

- Flower Server
- Multiple Federated Clients
- Global Model Aggregation
- Distributed Training
- Global Model Distribution
- Privacy-Preserving Learning
- Multiclass Intrusion Detection Model
- PyTorch Neural Network

---

## Machine Learning

- PyTorch MLP Network
- CICIDS2017 Dataset
- Real-Time Inference
- Confidence Score Generation
- Prediction Latency Measurement
- Model Version Tracking

---

## Explainable AI (Roadmap)

The system architecture already includes support for AI-assisted cyber threat analysis.

Planned capabilities include:

- Retrieval-Augmented Generation (RAG)
- FAISS Vector Database
- Sentence Transformers
- Groq LLM
- Google Gemini
- MITRE ATT&CK Mapping
- AI Generated Incident Summary
- Attack Explanation
- Root Cause Analysis
- Recommended Mitigation
- Security Analyst Report

---

# System Workflow

```
                    Live Network Traffic
                             │
                             ▼
                    Packet Capture Engine
                             │
                             ▼
                      Packet Queue
                             │
                             ▼
                    Flow Generation Engine
                             │
                             ▼
                  Feature Extraction Engine
                             │
                             ▼
                      Data Preprocessing
                             │
                             ▼
               Federated Deep Learning Model
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
       Prediction Database           Alert Database
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    FastAPI REST APIs
                             │
                             ▼
                   React Dashboard
                             │
                             ▼
                 LLM + RAG Explainability
                       (Future Release)
```

---

# Technology Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- JWT Authentication

---

## Machine Learning

- PyTorch
- Flower
- Scikit-Learn
- Pandas
- NumPy

---

## Explainable AI

- FAISS
- Sentence Transformers
- Groq
- Google Gemini

---

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

---

## Database

- PostgreSQL

Tables

- users
- alerts
- predictions
- incidents
- audit_logs
- model_versions
- chat_history

---

## DevOps

Current

- Git
- GitHub

Planned

- Docker
- Docker Compose
- GitHub Actions
- Kubernetes
- AWS Deployment

---

# Project Structure

```
SentinelAI

backend/
│
├── auth/
├── capture/
├── flow/
├── federated/
├── services/
├── routes/
├── websocket/
├── rag/
├── llm/
├── models/
├── database/
├── middleware/
├── reports/
├── notifications/
├── threat_intel/
├── utils/
├── engine.py
└── main.py

frontend/

docs/

datasets/

docker/

```
# Current Project Status

| Module | Status |
|---------|--------|
| Enterprise Backend | ✅ Completed |
| Authentication & Authorization | ✅ Completed |
| PostgreSQL Integration | ✅ Completed |
| SQLAlchemy ORM | ✅ Completed |
| Prediction API | ✅ Completed |
| Alerts API | ✅ Completed |
| Prediction History | ✅ Completed |
| Real-Time Detection Engine | ✅ Completed |
| Packet Capture Engine | ✅ Completed |
| Flow Generation | ✅ Completed |
| Feature Extraction | ✅ Completed |
| Data Preprocessing | ✅ Completed |
| Federated Learning Framework | ✅ Completed |
| Global Model Inference | ✅ Completed |
| Multiclass IDS Model | 🚧 In Progress |
| React Dashboard | 🚧 In Progress |
| WebSocket Live Monitoring | 🚧 In Progress |
| LLM + RAG Attack Explanation | 🚧 In Progress |
| Threat Intelligence | ⏳ Planned |
| Docker Deployment | ⏳ Planned |

---

# Installation

## Clone Repository

```bash
git clone https://github.com/khvs09/Intrusion-Detection-System.git

cd Intrusion-Detection-System
```

---

## Create Virtual Environment

Windows

```bash
python -m venv venv

venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure PostgreSQL

Create a database named

```
sentinel_ai
```

Update the PostgreSQL connection inside

```
backend/database/connection.py
```

---

## Initialize Database

```bash
cd backend

python -m database.init_db
```

---

# Running the Federated Learning System

## Start Flower Server

```bash
python -m federated.server
```

---

## Start Client 1

```bash
python -m federated.client --client-id 0
```

---

## Start Client 2

```bash
python -m federated.client --client-id 1
```

---

## Start Client 3

```bash
python -m federated.client --client-id 2
```

The clients collaboratively train a global intrusion detection model using the CICIDS2017 dataset.

---

# Running the Backend

```bash
cd backend

uvicorn main:app --reload
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

# Running the Real-Time Detection Engine

Start the packet capture engine

```bash
POST /engine/start
```

Stop the engine

```bash
POST /engine/stop
```

Engine Statistics

```bash
GET /engine/statistics
```

The detection engine continuously performs

```
Packet Capture
        ↓
Packet Queue
        ↓
Flow Generation
        ↓
Feature Extraction
        ↓
Preprocessing
        ↓
Federated Model Prediction
        ↓
Prediction Storage
        ↓
Alert Generation
```

---

# API Endpoints

## Authentication

```
POST /auth/register
```

```
POST /auth/login
```

```
GET /auth/me
```

---

## Detection Engine

```
POST /engine/start
```

```
POST /engine/stop
```

```
GET /engine/statistics
```

---

## Predictions

```
POST /predict
```

```
GET /predictions
```

---

## Alerts

```
GET /alerts
```

---

## AI Chatbot

```
POST /chatbot/explain
```

```
GET /chatbot/explain/{alert_id}
```

---

# Federated Learning Workflow

```
Client 1 ─┐
          │
Client 2 ─┼────────► Flower Server
          │
Client 3 ─┘
                 │
                 ▼
         Federated Aggregation
                 │
                 ▼
          Global IDS Model
                 │
                 ▼
        Real-Time Detection Engine
```

---

# Development Roadmap

## ✅ Phase 1 — Enterprise Backend

- Enterprise Architecture
- PostgreSQL
- Authentication
- Prediction APIs
- Alert APIs
- Prediction History
- Database Models
- Federated Learning Integration

---

## ✅ Phase 2 — Real-Time Detection

- Packet Capture
- Queue Management
- Flow Generation
- Feature Extraction
- Preprocessing
- Continuous Detection Engine
- Automatic Prediction Logging
- Automatic Alert Generation

---

## 🚧 Phase 3 — Enterprise AI

- Multiclass CICIDS2017 Classification
- 15-Class Federated Model
- LLM Attack Explanation
- RAG Knowledge Base
- MITRE ATT&CK Mapping
- AI Incident Summary
- Security Recommendations
- Attack Timeline

---

## 🚧 Phase 4 — Enterprise Dashboard

- Live Dashboard
- Live Alerts
- Live Predictions
- WebSocket Updates
- Interactive Charts
- Incident Management
- User Analytics

---

## ⏳ Phase 5 — Enterprise Security Platform

- Threat Intelligence
- AbuseIPDB Integration
- VirusTotal Integration
- GeoIP Lookup
- WHOIS Lookup
- SIEM Integration
- Email Notifications
- Slack Integration
- Discord Notifications
- Report Generation
- Docker Deployment
- Kubernetes Deployment
- CI/CD Pipeline
- Cloud Deployment

---

# Future Enhancements

- Explainable AI Dashboard
- AI SOC Assistant
- MITRE ATT&CK Navigator
- Threat Hunting Dashboard
- IOC Management
- Model Version Management
- Active Learning
- Incremental Federated Learning
- Multi-Interface Packet Capture
- GPU Inference Support
- Multi-Tenant Deployment
- Prometheus Monitoring
- Grafana Dashboards

---

# Performance Goals

- Low Prediction Latency (<10 ms)
- High Detection Accuracy
- Privacy-Preserving Federated Training
- Scalable Enterprise Architecture
- Modular Components
- Continuous Detection
- Efficient Flow Processing
- High Throughput Packet Analysis

---

# Contributors

- Sai Rohith
- Harsha Vardhan Sharma
- Hasini

---

# Repository

GitHub Repository

```
https://github.com/khvs09/Intrusion-Detection-System
```

---

# License

This project is developed for educational, research, and academic purposes.

---

# Disclaimer

SentinelAI is intended for authorized security monitoring, cybersecurity research, and educational use.

Users must obtain proper authorization before monitoring or analyzing network traffic. Unauthorized monitoring may violate organizational policies or applicable laws.

---

# Acknowledgements

This project is built using:

- FastAPI
- PostgreSQL
- SQLAlchemy
- PyTorch
- Flower Federated Learning
- React
- TypeScript
- Tailwind CSS
- FAISS
- Sentence Transformers
- Groq
- Google Gemini
- Scikit-learn
- Pandas
- NumPy
- CICIDS2017 Dataset
- Wireshark
- Scapy

---

# Version

**Current Version:** v3.0.0

---

# Project Status

**Development Status:** Active 🚀

Current capabilities include enterprise backend services, real-time packet capture, flow generation, feature extraction, prediction logging, alert management, and federated deep learning inference.

The next major milestone is upgrading the IDS from binary classification to full CICIDS2017 multiclass detection (15 attack categories) and integrating LLM + RAG to provide detailed attack explanations, MITRE ATT&CK mapping, root cause analysis, and remediation guidance for security analysts.
