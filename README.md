# SentinelAI
### Enterprise Real-Time Federated Intrusion Detection System with Explainable AI

SentinelAI is an enterprise-grade Intrusion Detection System (IDS) that combines Federated Learning, Retrieval-Augmented Generation (RAG), Large Language Models (LLMs), PostgreSQL, and FastAPI to detect, analyze, and explain network attacks.

The project is designed to evolve into a real-time network security platform capable of monitoring live traffic, detecting intrusions, generating AI-powered explanations, and presenting results through a modern web dashboard.

---

# Features

## Implemented

### Authentication
- JWT Authentication
- User Registration
- User Login
- Password Hashing (bcrypt)
- Protected API Routes
- Role-based User Model

### Backend
- FastAPI REST API
- Enterprise Modular Architecture
- PostgreSQL Integration
- SQLAlchemy ORM
- Database Initialization

### Federated Learning
- Flower Framework
- Global Model Aggregation
- Federated Clients
- Global Model Prediction

### Explainable AI
- Retrieval-Augmented Generation (RAG)
- FAISS Vector Database
- Sentence Transformers
- LLM-based Attack Explanation
- Context-aware Responses

### AI Models
- PyTorch MLP Intrusion Detection Model
- Global Model Loading
- Prediction API

---

# Planned Features

- Live Packet Capture
- Real-Time Flow Generation
- Automatic Feature Extraction
- Continuous Intrusion Detection
- Automatic Alert Generation
- WebSocket Live Dashboard
- Threat Intelligence Integration
- Incident Management
- PDF/CSV Reports
- Docker Deployment
- CI/CD Pipeline
- Production Deployment

---

# Project Architecture

```
                   React Frontend
                         │
                         ▼
                  FastAPI Backend
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
 Authentication      Prediction        Chatbot
        │                │                │
        ▼                ▼                ▼
 PostgreSQL      Federated Model      RAG + LLM
                         │
                         ▼
                  Attack Detection
```

---

# Tech Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

## Machine Learning

- PyTorch
- Flower Federated Learning
- Scikit-Learn

## Explainable AI

- FAISS
- Sentence Transformers
- Groq LLM
- Google Gemini

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

## Database

- PostgreSQL

## DevOps

- Git
- GitHub

---

# Folder Structure

```
backend/

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
```

---

# Current Project Status

| Module | Status |
|---------|--------|
| Enterprise Backend | ✅ Completed |
| PostgreSQL | ✅ Completed |
| Authentication | ✅ Completed |
| Federated Learning | ✅ Completed |
| RAG | ✅ Completed |
| LLM Integration | ✅ Completed |
| Prediction API | ✅ Completed |
| Chatbot API | ✅ Completed |
| Frontend Dashboard | 🚧 In Progress |
| Real-Time Detection | 🚧 In Progress |
| WebSockets | 🚧 Planned |
| Threat Intelligence | 🚧 Planned |
| Docker Deployment | 🚧 Planned |

---

# Installation

## Clone Repository

```bash
git clone https://github.com/khvs09/Intrusion-Detection-System.git

cd Intrusion-Detection-System
```

---

## Create Virtual Environment

```bash
python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Linux/macOS

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure PostgreSQL

Create a PostgreSQL database:

```
sentinel_ai
```

Update the database URL inside:

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

## Run Backend

```bash
uvicorn main:app --reload
```

---

## Swagger

```
http://127.0.0.1:8000/docs
```

---

# Authentication Endpoints

## Register

```
POST /auth/register
```

## Login

```
POST /auth/login
```

## Current User

```
GET /auth/me
```

---

# AI Explanation Endpoint

```
POST /chatbot/explain
```

---

# Prediction Endpoint

```
POST /predict
```

---

# Future Roadmap

## Phase 1
- Enterprise Backend
- Authentication
- PostgreSQL
- Federated Learning
- RAG

Status: ✅ Completed

---

## Phase 2

- Live Packet Capture
- Flow Generation
- Feature Extraction
- Real-Time Prediction
- Automatic Alerts
- WebSocket Dashboard

Status: 🚧 In Progress

---

## Phase 3

- Threat Intelligence
- Incident Response
- Reports
- Docker
- CI/CD
- Cloud Deployment

Status: ⏳ Planned

---

# Contributors

- Rohith, Harsha and Hasini.
  

---

# License

This project is developed for educational and research purposes.
