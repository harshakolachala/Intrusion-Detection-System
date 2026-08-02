# Federated Intrusion Detection System using Flower, PyTorch, FastAPI and React

## Overview

The **Federated Intrusion Detection System (FL-IDS)** is a privacy-preserving network intrusion detection solution that leverages **Federated Learning (FL)** to train machine learning models across multiple clients without sharing raw network traffic data.

Each client trains a local **Multi-Layer Perceptron (MLP)** model on its own data. The **Flower** framework aggregates the local model parameters using the **Federated Averaging (FedAvg)** algorithm to produce a global intrusion detection model.

The project integrates **FastAPI** for backend services, **React** for the frontend interface, and is designed to support **Retrieval-Augmented Generation (RAG)** and **Large Language Models (LLMs)** for intelligent cybersecurity analysis and attack explanation.

---

# Features

- Privacy-preserving Federated Learning
- CICIDS2017 Dataset preprocessing
- Data cleaning and normalization
- Feature scaling using StandardScaler
- Label encoding
- Multi-Layer Perceptron (MLP) based IDS
- Flower-based Federated Learning
- FedAvg aggregation strategy
- Multi-client federated training
- FastAPI backend
- REST Prediction API
- Swagger API Documentation
- Analytics Dashboard API
- React Frontend
- Real-time Intrusion Prediction
- RAG Integration (Planned)
- LLM-based Attack Explanation (Planned)

---

# Project Structure

```text
Intrusion-Detection-System/
│
├── backend/
│   ├── federated/
│   │   ├── client.py
│   │   ├── config.py
│   │   ├── dataset.py
│   │   ├── evaluate.py
│   │   ├── model.py
│   │   ├── predict.py
│   │   ├── server.py
│   │   ├── strategy.py
│   │   ├── train.py
│   │   └── utils.py
│   │
│   ├── models/
│   ├── routes/
│   ├── llm/
│   ├── rag/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│
├── .github/
│
└── README.md
```

---

# Tech Stack

## Machine Learning

- PyTorch
- Scikit-learn
- NumPy
- Pandas

## Federated Learning

- Flower Framework

## Backend

- FastAPI
- SQLAlchemy
- SQLite

## Frontend

- React
- TypeScript
- Tailwind CSS

## AI Components

- Retrieval-Augmented Generation (Planned)
- Large Language Models (Planned)

---

# Dataset

**Dataset Used**

- CICIDS2017

The dataset is **not included** in this repository because it exceeds GitHub's file size limit.

Download the processed dataset and place it inside:

```text
backend/datasets/combinenew.csv
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/harshakolachala/Intrusion-Detection-System.git
```

Navigate into the project

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

## 1. Start Flower Server

```bash
cd backend
python -m federated.server
```

---

## 2. Start Flower Clients

Open three terminals.

### Terminal 1

```bash
python -m federated.client
```

### Terminal 2

```bash
python -m federated.client
```

### Terminal 3

```bash
python -m federated.client
```

---

## 3. Start FastAPI Backend

```bash
uvicorn main:app --reload
```

---

## 4. Open Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

## 5. Start React Frontend

```bash
cd frontend
npm run dev
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Project Status |
| GET | `/health` | Health Check |
| GET | `/analytics/stats` | Attack Statistics |
| POST | `/predict` | Intrusion Prediction |
| GET | `/chatbot/explain/{detection_id}` | Explain Detection |
| POST | `/chatbot/explain` | Manual Attack Explanation |

---

# Machine Learning Pipeline

```text
                  CICIDS2017 Dataset
                          │
                          ▼
                 Data Preprocessing
      (Cleaning • Encoding • Scaling)
                          │
                          ▼
                 Train-Test Split
                          │
                          ▼
             Client Data Partitioning
                          │
                          ▼
                Local MLP Training
                          │
                          ▼
          Federated Learning (Flower)
                          │
                          ▼
          Federated Averaging (FedAvg)
                          │
                          ▼
               Global Intrusion Model
                          │
                          ▼
                Prediction Module
                          │
                          ▼
                FastAPI REST API
                          │
                          ▼
                  React Frontend
```

---

# Current Project Status

| Module | Status |
|---------|--------|
| Dataset Preprocessing | ✅ Completed |
| Feature Engineering | ✅ Completed |
| MLP Model | ✅ Completed |
| Local Training | ✅ Completed |
| Model Evaluation | ✅ Completed |
| Flower Integration | ✅ Completed |
| Federated Training | ✅ Completed |
| Prediction Module | ✅ Completed |
| FastAPI Prediction API | ✅ Completed |
| Swagger API Testing | ✅ Completed |
| Analytics API | ✅ Completed |
| React Frontend | ✅ Completed |
| Global Model Saving | ⏳ In Progress |
| RAG Integration | ⏳ Planned |
| LLM Integration | ⏳ Planned |
| Explainable AI | ⏳ Planned |

---

# Future Enhancements

- Automatic saving of the trained global federated model
- End-to-end Federated Learning workflow
- Retrieval-Augmented Generation (RAG)
- LLM-powered attack explanation
- Explainable AI for prediction interpretation
- Real-time network traffic monitoring
- Docker containerization
- CI/CD pipeline using GitHub Actions
- Cloud deployment (AWS/GCP/Azure)

---

# Contributors

Sai Rohit, Harsha and Hasini
---

# License

This project was developed as a **B.Tech Major Project** for educational and research purposes.
