# Enhancing Federated Intrusion Detection Through LLM-Driven Alert Explanation

An enterprise-grade Intrusion Detection System (IDS) that combines **Federated Learning**, **Retrieval-Augmented Generation (RAG)**, and **Large Language Models (LLMs)** to detect cyber threats, generate intelligent explanations, and provide a scalable security monitoring platform.

---

# Overview

This project enhances traditional Intrusion Detection Systems by integrating Federated Learning with Explainable AI. Instead of relying on centralized training and static alerts, the system is designed to provide privacy-preserving intrusion detection with AI-generated explanations for detected attacks.

The platform is being developed into a real-time enterprise IDS capable of monitoring live network traffic, detecting anomalies, storing security events, and assisting analysts with contextual explanations.

---

# Objectives

- Develop a Federated Learning-based Intrusion Detection System
- Preserve data privacy using decentralized model training
- Improve alert interpretation using Retrieval-Augmented Generation (RAG)
- Generate human-readable attack explanations using Large Language Models
- Build an enterprise-grade backend with authentication and database support
- Extend the system to support real-time network monitoring

---

# Features

## Implemented

### Backend
- FastAPI REST API
- Modular Enterprise Architecture
- PostgreSQL Integration
- SQLAlchemy ORM
- Database Initialization

### Authentication
- User Registration
- User Login
- JWT Authentication
- Password Hashing (bcrypt)
- Protected API Routes
- Role-Based User Model

### Federated Learning
- Flower Framework
- Federated Client-Server Architecture
- Global Model Aggregation
- Global Model Prediction

### Explainable AI
- Retrieval-Augmented Generation (RAG)
- FAISS Vector Database
- Sentence Transformers
- LLM-based Attack Explanation
- Context Retrieval Pipeline

### Machine Learning
- PyTorch Intrusion Detection Model
- Global Model Loading
- Prediction API

---

# Planned Features

- Live Packet Capture
- Network Flow Generation
- Automatic Feature Extraction
- Real-Time Intrusion Detection
- Automatic Alert Generation
- Live Dashboard using WebSockets
- Threat Intelligence Integration
- Incident Management
- Security Reports
- Docker Deployment
- CI/CD Pipeline
- Cloud Deployment

---

# System Architecture

```
                    React Frontend
                           │
                           ▼
                     FastAPI Backend
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
      ▼                    ▼                    ▼
Authentication       Prediction API        Chatbot API
      │                    │                    │
      ▼                    ▼                    ▼
 PostgreSQL      Federated Learning      RAG + LLM
                           │
                           ▼
                  Intrusion Detection
```

---

# Technology Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

## Machine Learning

- PyTorch
- Flower Federated Learning
- Scikit-learn

## Explainable AI

- FAISS
- Sentence Transformers
- Groq
- Google Gemini

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

## Database

- PostgreSQL

## Version Control

- Git
- GitHub

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
```

---

# Current Project Status

| Module | Status |
|---------|--------|
| Enterprise Backend | ✅ Completed |
| PostgreSQL Integration | ✅ Completed |
| Authentication | ✅ Completed |
| Federated Learning | ✅ Completed |
| RAG Pipeline | ✅ Completed |
| LLM Integration | ✅ Completed |
| Prediction API | ✅ Completed |
| Chatbot API | ✅ Completed |
| Frontend Dashboard | 🚧 In Progress |
| Real-Time Detection | 🚧 In Progress |
| Threat Intelligence | ⏳ Planned |
| Docker Deployment | ⏳ Planned |

---

# Installation

## Clone Repository

```bash
git clone https://github.com/<your-username>/Intrusion-Detection-System.git

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

Create a PostgreSQL database.

Example:

```
sentinel_ai
```

Update the database configuration inside:

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

## API Documentation

```
http://127.0.0.1:8000/docs
```

---

# Available APIs

## Authentication

```
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

## Prediction

```
POST /predict
```

---

## Explainable AI

```
POST /chatbot/explain
GET  /chatbot/explain/{detection_id}
```

---

# Development Roadmap

## Phase 1 ✅ Completed

- Enterprise Backend
- PostgreSQL Integration
- JWT Authentication
- Federated Learning
- RAG Integration
- LLM Integration

---

## Phase 2 🚧 In Progress

- Packet Capture
- Flow Generation
- Feature Extraction
- Real-Time Prediction
- Automatic Alert Generation
- Live Dashboard

---

## Phase 3 ⏳ Planned

- Threat Intelligence
- Incident Management
- Reports
- Docker
- CI/CD
- Cloud Deployment

---

# Contributors

- Rohith, Harsha and Hasini

---

# License

This project is developed as 'Major Project' for educational and research purpose
