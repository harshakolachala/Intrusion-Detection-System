# SentinelAI

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-2.x-red)
![License](https://img.shields.io/badge/License-Educational-orange)

# Enterprise Real-Time Federated Intrusion Detection System with Explainable AI

SentinelAI is an enterprise-grade Intrusion Detection System (IDS) that combines **Federated Learning**, **Retrieval-Augmented Generation (RAG)**, **Large Language Models (LLMs)**, **FastAPI**, **PostgreSQL**, and **React** to detect, analyze, and explain cyber attacks.

Unlike traditional IDS solutions that rely on centralized datasets and static alerts, SentinelAI is designed as a modular, scalable platform capable of supporting real-time traffic monitoring, AI-powered attack explanations, and enterprise security workflows.

---

# Key Highlights

- Enterprise Modular Architecture
- Federated Learning using Flower
- Explainable AI using RAG + LLM
- JWT Authentication
- PostgreSQL Database
- React + TypeScript Dashboard
- AI-Powered Attack Explanations
- Real-Time Intrusion Detection (In Progress)
- WebSocket Live Monitoring (In Progress)

---

# Features

## Authentication

- JWT Authentication
- User Registration
- User Login
- Password Hashing (bcrypt)
- Protected API Routes
- Role-Based User Management

---

## Backend

- FastAPI REST APIs
- Enterprise Folder Structure
- SQLAlchemy ORM
- PostgreSQL Integration
- Dependency Injection
- API Documentation (Swagger)

---

## Federated Learning

- Flower Framework
- Global Model Aggregation
- Distributed Clients
- Global IDS Model
- Model Prediction API

---

## Explainable AI

- Retrieval-Augmented Generation (RAG)
- FAISS Vector Database
- Sentence Transformers
- Groq LLM
- Google Gemini Support
- Context-Aware Attack Explanations

---

## Machine Learning

- PyTorch MLP IDS Model
- Global Model Loading
- Attack Prediction API
- Confidence Score Generation

---

# Planned Features

- Live Packet Capture
- Flow Generation
- Automatic Feature Extraction
- Continuous Intrusion Detection
- Automatic Alert Generation
- Incident Management
- Threat Intelligence Integration
- WebSocket Live Dashboard
- PDF Report Generation
- CSV Report Export
- Docker Deployment
- Kubernetes Support
- CI/CD Pipeline
- Cloud Deployment

---

# System Architecture

```
                    React Dashboard
                           │
                           ▼
                     FastAPI Backend
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Authentication      Prediction API      Chatbot API
        │                  │                  │
        ▼                  ▼                  ▼
 PostgreSQL       Federated Learning     RAG + LLM
                           │
                           ▼
                    Attack Detection
```

---

# Technology Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

---

## Machine Learning

- PyTorch
- Flower
- Scikit-Learn
- NumPy
- Pandas

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

---

## DevOps

- Git
- GitHub
- Docker *(Planned)*
- GitHub Actions *(Planned)*

---

# Project Structure

```
backend/
│
├── auth/
├── database/
├── models/
├── routes/
├── services/
├── websocket/
├── capture/
├── flow/
├── anomaly/
├── notifications/
├── threat_intel/
├── reports/
├── middleware/
├── utils/
├── federated/
├── rag/
├── llm/
└── main.py

frontend/

docs/

docker/
```

---

# Current Project Status

| Module | Status |
|---------|--------|
| Enterprise Backend | ✅ Completed |
| PostgreSQL | ✅ Completed |
| Authentication | ✅ Completed |
| Federated Learning | ✅ Completed |
| RAG Pipeline | ✅ Completed |
| LLM Integration | ✅ Completed |
| Prediction API | ✅ Completed |
| Chatbot API | ✅ Completed |
| Frontend Dashboard | 🚧 In Progress |
| Real-Time Detection | 🚧 In Progress |
| WebSockets | ⏳ Planned |
| Threat Intelligence | ⏳ Planned |
| Docker Deployment | ⏳ Planned |

---

# Installation

## Clone Repository

```bash
git clone https://github.com/khvs09/Intrusion-Detection-System.git

cd Intrusion-Detection-System
```

## Create Virtual Environment

```bash
python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Configure PostgreSQL

Create a PostgreSQL database named:

```
sentinel_ai
```

Update the database configuration inside:

```
backend/database/connection.py
```

## Initialize Database

```bash
cd backend

python -m database.init_db
```

## Run Backend

```bash
uvicorn main:app --reload
```

## Swagger Documentation

```
http://127.0.0.1:8000/docs
```
---

# API Endpoints

## Authentication

### Register User

```http
POST /auth/register
```

### Login User

```http
POST /auth/login
```

### Get Current User

```http
GET /auth/me
```

---

## Prediction

Predict whether a network flow is normal or malicious.

```http
POST /predict
```

---

## AI Chatbot

Generate an AI explanation for a detected attack.

```http
POST /chatbot/explain
```

Retrieve explanation using detection ID.

```http
GET /chatbot/explain/{detection_id}
```

---

# Database Schema

Current database tables include:

- users
- alerts
- predictions
- chat_history
- incidents
- audit_logs
- model_versions

---

# Development Roadmap

## ✅ Phase 1 — Enterprise Backend (Completed)

- Enterprise Folder Structure
- PostgreSQL Integration
- SQLAlchemy ORM
- JWT Authentication
- User Registration
- User Login
- Protected APIs
- Federated Learning Integration
- RAG Integration
- LLM Integration
- Prediction API
- AI Chatbot

---

## 🚧 Phase 2 — Real-Time Detection Engine (In Progress)

- Live Packet Capture
- Network Flow Generation
- Automatic Feature Extraction
- Continuous Prediction
- Automatic Alert Creation
- Incident Management
- WebSocket Server
- Live Dashboard Updates

---

## ⏳ Phase 3 — Enterprise Features

- Threat Intelligence
- AbuseIPDB Integration
- VirusTotal Integration
- GeoIP Lookup
- WHOIS Lookup
- PDF Report Generation
- CSV Export
- Docker Deployment
- Docker Compose
- GitHub Actions CI/CD
- Cloud Deployment
- Performance Optimization

---

# Project Workflow

```
                 Live Network Traffic
                          │
                          ▼
                  Packet Capture Engine
                          │
                          ▼
                   Flow Generation
                          │
                          ▼
                Feature Extraction
                          │
                          ▼
              Federated Learning Model
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      Prediction API            PostgreSQL
              │                       │
              ▼                       ▼
       AI Explanation          Alert Storage
              │                       │
              └───────────┬───────────┘
                          ▼
                 React Dashboard
```

---

# Future Enhancements

- Multi-Interface Packet Capture
- IDS Rule Engine
- Automatic Incident Assignment
- Email Notifications
- SMS Notifications
- Discord Alerts
- Slack Integration
- SIEM Integration
- Multiple Federated Clients
- Model Version Management
- Explainability Dashboard
- Attack Timeline Visualization
- Network Topology Visualization
- Threat Hunting Dashboard
- Kubernetes Deployment
- AWS Deployment
- Azure Deployment
- Prometheus Monitoring
- Grafana Dashboard

---

# Screenshots

Screenshots will be added as development progresses.

Planned screenshots:

- Login Page
- Registration Page
- Dashboard
- Analytics
- Live Alerts
- AI Chatbot
- Incident Management
- Prediction History
- User Profile

---

# Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Protected API Endpoints
- SQLAlchemy ORM
- PostgreSQL Database
- Audit Logging
- Role-Based User Access
- Enterprise Backend Architecture

---

# Performance Goals

- Real-Time Packet Processing
- Low Prediction Latency
- Modular Architecture
- Scalable Backend
- Efficient Database Operations
- Enterprise-Level Maintainability

---

# Contributors

## Backend & Integration

Harsha Vardhan Sharma

## AI & Federated Learning

Hasini

## Frontend Development

Sai Rohith

---

# Repository

GitHub Repository

```
https://github.com/khvs09/Intrusion-Detection-System
```

---

# License

This project is developed for educational, academic, and research purposes.

---

# Disclaimer

This project is intended for educational and research use only.

The real-time packet capture functionality should only be used on networks where you have explicit authorization to monitor and analyze traffic.

Unauthorized monitoring of network traffic may violate organizational policies or applicable laws.

---

# Acknowledgements

This project makes use of the following technologies:

- FastAPI
- PostgreSQL
- SQLAlchemy
- PyTorch
- Flower Federated Learning
- FAISS
- Sentence Transformers
- React
- Tailwind CSS
- TypeScript
- Scikit-learn
- Groq
- Google Gemini

---

## Project Status

**Current Version:** v2.0.0

**Development Status:** Active 🚀

SentinelAI is under active development. Upcoming releases will introduce real-time network monitoring, continuous intrusion detection, enterprise dashboard enhancements, threat intelligence integration, and production-ready deployment support.
