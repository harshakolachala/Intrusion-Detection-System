# Federated Intrusion Detection System using Flower, PyTorch, FastAPI and React

## Overview

This project implements a **Federated Intrusion Detection System (FL-IDS)** that detects malicious network traffic while preserving data privacy. Instead of sending raw network traffic to a central server, multiple clients train a local machine learning model independently. The Flower framework aggregates the local model parameters using the Federated Averaging (FedAvg) algorithm to produce a global intrusion detection model.

The system uses a Multi-Layer Perceptron (MLP) for intrusion detection and is designed to integrate with FastAPI, React, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs) for intelligent cybersecurity analysis.

---

## Features

- Data preprocessing and cleaning
- Feature scaling using StandardScaler
- Label encoding
- Multi-Layer Perceptron (MLP) model
- Federated Learning using Flower
- FedAvg aggregation strategy
- Multi-client federated training
- FastAPI backend
- React frontend
- Prediction module (In Progress)
- RAG integration (Planned)
- LLM-based attack explanation (Planned)

---

## Project Structure

```
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

## Tech Stack

### Machine Learning

- PyTorch
- Scikit-learn
- NumPy
- Pandas

### Federated Learning

- Flower Framework

### Backend

- FastAPI
- SQLAlchemy
- SQLite

### Frontend

- React
- TypeScript
- Tailwind CSS

### Future AI Components

- RAG
- LLM

---

## Dataset

Dataset Used:

**CICIDS2017**

Due to GitHub's file size limitations, the dataset is not included in this repository.

Download the dataset separately and place the processed dataset here:

```
backend/datasets/combinenew.csv
```

---

## Installation

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

## Running the Project

### Start Flower Server

```bash
cd backend
python -m federated.server
```

---

### Start Flower Clients

Terminal 1

```bash
python -m federated.client
```

Terminal 2

```bash
python -m federated.client
```

Terminal 3

```bash
python -m federated.client
```

---

### Start FastAPI Backend

```bash
uvicorn main:app --reload
```

---

### Start React Frontend

```bash
cd frontend
npm run dev
```

---

## Machine Learning Pipeline

```
Dataset
      │
      ▼
Data Preprocessing
      │
      ▼
Feature Scaling
      │
      ▼
MLP Model
      │
      ▼
Federated Training
      │
      ▼
FedAvg Aggregation
      │
      ▼
Global Model
      │
      ▼
Prediction
```

---

## Current Project Status

| Module | Status |
|---------|--------|
| Dataset Preprocessing | ✅ Completed |
| MLP Model | ✅ Completed |
| Local Training | ✅ Completed |
| Flower Integration | ✅ Completed |
| Federated Training | ✅ Completed |
| Global Model Saving | ⏳ In Progress |
| Prediction Module | ⏳ In Progress |
| FastAPI Prediction API | ⏳ Pending |
| React Integration | ⏳ Pending |
| RAG Integration | ⏳ Pending |
| LLM Integration | ⏳ Pending |

---

## Future Enhancements

- Automatic Global Model Saving
- Prediction API
- Explainable AI
- Retrieval-Augmented Generation (RAG)
- LLM-based Attack Explanation
- Real-time Network Traffic Monitoring
- CI/CD Deployment

---

## Contributors

-SaiRohit, Harsha and Hasini

---

## License

This project is developed as part of college major project for educational and research purpose
