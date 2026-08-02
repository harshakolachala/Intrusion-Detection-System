# Federated Intrusion Detection System (FL-IDS)

A privacy-preserving **Federated Intrusion Detection System (FL-IDS)** built using **Flower, PyTorch, FastAPI, React, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs)**.

The system enables multiple clients to collaboratively train an intrusion detection model without sharing raw network traffic. It also provides AI-powered explanations for detected attacks using a cybersecurity knowledge base and modern LLMs.

---

# Project Overview

Traditional Intrusion Detection Systems require centralized collection of network traffic, creating privacy and security concerns.

This project addresses those issues by combining:

- Federated Learning for decentralized model training
- Deep Learning for intrusion detection
- FastAPI backend services
- React frontend dashboard
- Retrieval-Augmented Generation (RAG)
- Groq/Gemini LLM integration for attack explanations

The project is designed to evolve into a deployable enterprise cybersecurity platform.

---

# Features

## Machine Learning

- Intrusion Detection using Multi-Layer Perceptron (MLP)
- PyTorch implementation
- Model evaluation
- Automatic prediction

## Federated Learning

- Flower Framework
- Multi-client training
- FedAvg aggregation
- Automatic global model checkpoint saving

## Backend

- FastAPI REST APIs
- Prediction API
- Analytics API
- Chatbot API
- SQLAlchemy
- SQLite

## Frontend

- React
- TypeScript
- Tailwind CSS
- Dashboard
- Analytics
- Alerts
- Prediction Page

## Artificial Intelligence

- Retrieval-Augmented Generation (RAG)
- FAISS Vector Database
- Sentence Transformers
- Cybersecurity Knowledge Base
- Groq LLM
- Google Gemini Support
- AI-powered attack explanations

---

# Project Architecture

```text
                    +------------------------+
                    |     React Frontend     |
                    +-----------+------------+
                                |
                                |
                    FastAPI Backend APIs
                                |
        -------------------------------------------------
        |                |                |              |
        ▼                ▼                ▼              ▼
 Prediction API     Analytics API    Chatbot API    Health API
        |                                |
        |                                |
        ▼                                ▼
 Federated Model                 RAG Pipeline
        |                                |
        |                     ------------------------
        |                     |          |           |
        ▼                     ▼          ▼           ▼
 Flower Server           FAISS DB   Retriever   LLM (Groq/Gemini)
        |
        ▼
Federated Clients
        |
        ▼
CICIDS2017 Dataset
```

---

# Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- Axios

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

## Machine Learning

- PyTorch
- NumPy
- Pandas
- Scikit-learn

## Federated Learning

- Flower

## AI & RAG

- Sentence Transformers
- FAISS
- Groq API
- Google Gemini
- Markdown Knowledge Base

---

# Project Structure

```text
Intrusion-Detection-System/
│
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
│   │   └── utils.py
│   │
│   ├── rag/
│   │   ├── loader.py
│   │   ├── chunker.py
│   │   ├── embedder.py
│   │   ├── vector_store.py
│   │   ├── retriever.py
│   │   ├── rag_pipeline.py
│   │   ├── context_provider.py
│   │   ├── knowledge_base.py
│   │   ├── documents/
│   │   └── vector_db/
│   │
│   ├── llm/
│   ├── routes/
│   ├── models/
│   ├── reports/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│
├── .github/
│
├── screenshots/
│
└── README.md
```

---

# Dataset

Dataset Used:

**CICIDS2017**

Due to GitHub's file size limitations, the dataset is not included in this repository.

Place the processed dataset in:

```
backend/datasets/combinenew.csv
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/harshakolachala/Intrusion-Detection-System.git
```

Move into the project

```bash
cd Intrusion-Detection-System
```

Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

# Running the Project

## Start Flower Server

```bash
cd backend
python -m federated.server
```

---

## Start Flower Clients

Open three terminals.

```bash
python -m federated.client
```

Run the same command in each terminal.

---

## Start Backend

```bash
uvicorn main:app --reload
```

---

## Start Frontend

```bash
cd frontend
npm run dev
```

---

## Swagger API

```
http://127.0.0.1:8000/docs
```

---

# Machine Learning Pipeline

```text
CICIDS2017 Dataset
          │
          ▼
Data Cleaning
          │
          ▼
Feature Scaling
          │
          ▼
Client Partitioning
          │
          ▼
Local Model Training
          │
          ▼
Flower FedAvg
          │
          ▼
Global Model
          │
          ▼
Prediction API
```

---

# RAG Pipeline

```text
Cybersecurity Documents
          │
          ▼
Document Loader
          │
          ▼
Document Chunking
          │
          ▼
Sentence Embeddings
          │
          ▼
FAISS Vector Database
          │
          ▼
Retriever
          │
          ▼
Context Provider
          │
          ▼
Groq / Gemini LLM
          │
          ▼
AI Attack Explanation
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Project Status |
| GET | `/health` | Health Check |
| POST | `/predict` | Predict Network Traffic |
| GET | `/analytics/stats` | Dashboard Statistics |
| GET | `/chatbot/explain/{id}` | Explain Detection |
| POST | `/chatbot/explain` | Manual Attack Explanation |

---

# Current Project Status

| Module | Status |
|---------|--------|
| Dataset Preprocessing | ✅ Completed |
| Federated Learning | ✅ Completed |
| FedAvg Aggregation | ✅ Completed |
| Automatic Global Model Saving | ✅ Completed |
| MLP Model | ✅ Completed |
| Prediction API | ✅ Completed |
| FastAPI Backend | ✅ Completed |
| React Frontend | ✅ Completed |
| Analytics Dashboard | ✅ Completed |
| RAG Pipeline | ✅ Completed |
| FAISS Vector Database | ✅ Completed |
| AI Chatbot Backend | ✅ Completed |
| Groq Integration | ✅ Completed |
| Gemini Integration | ✅ Completed |

---

# Future Enhancements

- User Authentication (JWT)
- Login & Registration
- Real-time Dashboard
- Live Network Traffic Monitoring
- Prediction History
- AI Chat Interface
- Role-Based Access Control
- Docker Support
- Kubernetes Deployment
- CI/CD using GitHub Actions
- PostgreSQL
- Redis Caching
- Cloud Deployment (AWS / Azure / GCP)
- HTTPS & SSL
- Monitoring with Prometheus & Grafana
- Multi-class Intrusion Detection
- Explainable AI (SHAP/LIME)

---

# Deployment Roadmap

The project is being designed for future deployment using:

Frontend
- Vercel / Netlify

Backend
- Docker
- FastAPI
- Nginx

Database
- PostgreSQL

Federated Learning
- Flower SuperLink & SuperNodes

Vector Database
- FAISS (local) or ChromaDB

LLM
- Groq Cloud
- Google Gemini API

Cloud Platforms
- AWS
- Azure
- Google Cloud Platform

---

# Contributors

Rohith, Harsha and Hasini

---

# License

This project is developed as a B.Tech Major Project for educational, research, and cybersecurity learning purposes.
