# Federated Intrusion Detection System (FL-IDS)

A privacy-preserving **Federated Intrusion Detection System (FL-IDS)** built using **PyTorch**, **Flower**, **FastAPI**, and **React**. The system trains an intrusion detection model across multiple clients without sharing raw network traffic. It also integrates **Retrieval-Augmented Generation (RAG)** to provide contextual cybersecurity knowledge and is designed for future **LLM-based attack explanation**.

---

# Overview

Traditional Intrusion Detection Systems require centralized collection of network traffic, which raises privacy and security concerns.

This project addresses these challenges by using **Federated Learning**, where multiple clients train local machine learning models independently. Only model parameters are shared with the central server using the **Flower** framework.

To improve explainability, the project incorporates a **Retrieval-Augmented Generation (RAG)** pipeline that retrieves cybersecurity knowledge related to detected attacks. This retrieved context can later be used by a Large Language Model (LLM) to generate detailed attack explanations and mitigation strategies.

---

# Features

- Privacy-preserving Federated Learning
- Multi-client model training
- FedAvg aggregation strategy
- CICIDS2017 dataset preprocessing
- Feature scaling and label encoding
- Multi-Layer Perceptron (MLP) intrusion detection model
- FastAPI backend
- React frontend
- Prediction REST API
- Analytics dashboard
- Swagger API documentation
- RAG knowledge base
- Semantic document retrieval using FAISS
- Attack explanation pipeline (In Progress)
- LLM integration (In Progress)

---

# Architecture

```text
                    +-----------------------+
                    |   Network Dataset     |
                    +-----------+-----------+
                                |
                                v
                     Data Preprocessing
                                |
                                v
                     Federated Learning
                     (Flower + PyTorch)
                                |
             +------------------+------------------+
             |                                     |
      Client 1                               Client N
             |                                     |
             +------------------+------------------+
                                |
                                v
                       Global Model (FedAvg)
                                |
                                v
                     FastAPI Prediction API
                                |
          +---------------------+---------------------+
          |                                           |
          v                                           v
    React Frontend                           Analytics API
          |
          v
     RAG Knowledge Base
          |
          v
   Semantic Retrieval (FAISS)
          |
          v
     LLM Explanation (Planned)
```

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

- Flower

## Backend

- FastAPI
- SQLAlchemy
- SQLite

## Frontend

- React
- TypeScript
- Tailwind CSS

## RAG

- Sentence Transformers
- FAISS
- Markdown Knowledge Base

## Future AI

- Large Language Models (LLMs)

---

# Dataset

Dataset Used

- CICIDS2017

The dataset is not included in this repository because it exceeds GitHub's file size limit.

Place the processed dataset in:

```text
backend/datasets/combinenew.csv
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/harshakolachala/Intrusion-Detection-System.git
```

Navigate to the project

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

## Start Flower Clients

Open three terminals.

```bash
python -m federated.client
```

Run the same command in each terminal.

## Start FastAPI Backend

```bash
uvicorn main:app --reload
```

## Start React Frontend

```bash
cd frontend
npm run dev
```

## Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# API Endpoints

| Method | Endpoint | Description |
|----------|--------------------------|-----------------------------|
| GET | / | Project Status |
| GET | /health | Health Check |
| GET | /analytics/stats | Dashboard Analytics |
| POST | /predict | Predict Network Traffic |
| GET | /chatbot/explain/{id} | Explain Detection |
| POST | /chatbot/explain | Manual Explanation |

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
Train-Test Split
        │
        ▼
Client Partitioning
        │
        ▼
Local MLP Training
        │
        ▼
Federated Learning
        │
        ▼
FedAvg Aggregation
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
RAG Pipeline
          │
          ▼
LLM (Planned)
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
| Federated Learning | ✅ Completed |
| Prediction Module | ✅ Completed |
| FastAPI Backend | ✅ Completed |
| Prediction REST API | ✅ Completed |
| Analytics API | ✅ Completed |
| React Frontend | ✅ Completed |
| RAG Document Loader | ✅ Completed |
| Document Chunking | ✅ Completed |
| Sentence Embeddings | ✅ Completed |
| FAISS Vector Store | ✅ Completed |
| Retriever | ✅ Completed |
| RAG Pipeline | ✅ Completed |
| LLM Integration | ⏳ In Progress |
| Global Model Checkpointing | ⏳ In Progress |
| Final Testing | ⏳ In Progress |

---

# Future Enhancements

- Automatic saving of the trained global federated model
- LLM-powered attack explanation
- Real-time network packet capture
- Explainable AI (XAI)
- Docker deployment
- GitHub Actions CI/CD
- Cloud deployment
- Multi-class intrusion detection
- Live network monitoring

---

# Contributors

--Sai Rohit Harsha and Hasini--

---

# License

This project was developed as a **B.Tech Major Project** for educational and research purposes.
