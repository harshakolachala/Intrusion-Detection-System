# FedSentry Deployment Guide

FedSentry supports two deployment modes:

1. **Cloud SOC mode** — the public URL hosts the React dashboard, FastAPI backend, database, RAG/LLM services, reports, authentication, alerts, incidents, analytics, and manual IDS predictions.
2. **Distributed sensor mode** — a lightweight FedSentry sensor runs on each monitored machine or network sensor host. It captures traffic locally, creates flow records, extracts the same 78 CICIDS-style features, and sends only the feature vector plus connection metadata to the central FedSentry API.

Raw packet payloads are not uploaded by the sensor.

## Recommended architecture

```text
Monitored PC / Network A -> FedSentry Sensor --\
Monitored PC / Network B -> FedSentry Sensor ----> Public FastAPI Backend
Monitored PC / Network C -> FedSentry Sensor --/          |
                                                        PostgreSQL
                                                           |
                                     IDS Model -> Alerts -> Incidents
                                                           |
                                         RAG / LLM -> SOC Dashboard
```

## Backend environment

Create `backend/.env` from `.env.example` and configure at minimum:

```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:5432/DBNAME
SECRET_KEY=<long-random-secret>
AGENT_API_KEY=<long-random-sensor-secret>
ALLOWED_ORIGINS=https://your-frontend-domain.example

LLM_PROVIDER=groq
GROQ_API_KEY=<optional-provider-key>
```

Never commit these values.

## Frontend deployment

The production frontend must be built with the public backend URL:

```bash
VITE_API_URL=https://api.example.com npm run build
```

For Docker Compose:

```bash
VITE_API_URL=https://api.example.com docker compose up --build
```

The frontend Dockerfile accepts `VITE_API_URL` as a build argument.

## Backend deployment

The backend container must expose port 8000 internally and should normally sit behind an HTTPS reverse proxy or managed hosting service.

Verify after deployment:

```text
GET /health/live
GET /health/ready
GET /
```

The API root reports the remote sensor gateway path at `/agents/health`.

## Install a remote sensor

On the machine whose network interface will be monitored:

```bash
git clone https://github.com/harshakolachala/Intrusion-Detection-System.git
cd Intrusion-Detection-System/backend
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

Linux/macOS:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

Set the sensor configuration.

Windows Command Prompt:

```bat
set FEDSENTRY_API_URL=https://api.example.com
set FEDSENTRY_AGENT_ID=lab-pc-01
set FEDSENTRY_AGENT_KEY=<same-value-as-backend-AGENT_API_KEY>
python -m agent.sensor --interface "Wi-Fi"
```

PowerShell:

```powershell
$env:FEDSENTRY_API_URL="https://api.example.com"
$env:FEDSENTRY_AGENT_ID="lab-pc-01"
$env:FEDSENTRY_AGENT_KEY="<same-value-as-backend-AGENT_API_KEY>"
python -m agent.sensor --interface "Wi-Fi"
```

Linux/macOS:

```bash
export FEDSENTRY_API_URL=https://api.example.com
export FEDSENTRY_AGENT_ID=branch-office-01
export FEDSENTRY_AGENT_KEY=<same-value-as-backend-AGENT_API_KEY>
python -m agent.sensor --interface eth0
```

Packet capture may require administrator/root privileges and an installed capture driver such as Npcap on Windows.

## Sensor data path

```text
Local network interface
  -> Scapy packet capture
  -> packet queue
  -> flow generator
  -> 78-feature extractor
  -> missing-value preprocessing
  -> HTTPS POST /agents/ingest
  -> central IDS inference
  -> prediction persistence
  -> malicious-flow alert creation
  -> WebSocket SOC event
  -> public dashboard
```

## Sensor API security

Sensor requests use the `X-Agent-Key` header. The backend compares the supplied key using a constant-time comparison. The gateway remains disabled until `AGENT_API_KEY` is configured.

For an internet-facing deployment:

- use HTTPS only;
- use a long random `AGENT_API_KEY`;
- rotate the key if it is exposed;
- restrict the backend with firewall/rate-limit controls where possible;
- do not put the sensor key in frontend code;
- treat the sensor as a trusted machine credential.

## Public-demo behavior

When a user opens the deployed frontend URL, the following features operate through the cloud backend:

- authentication and profile;
- dashboard and analytics;
- manual 78-feature prediction;
- prediction history;
- alerts and incidents;
- audit logs;
- reports and exports;
- RAG/LLM assistant;
- WebSocket SOC updates;
- detections arriving from remote sensors.

The existing **Start Engine** button starts packet capture on the machine hosting the backend itself. For monitoring another laptop/network, run the remote sensor on that machine instead.

## End-to-end deployment test

1. Deploy PostgreSQL and the FastAPI backend.
2. Set `AGENT_API_KEY`, `SECRET_KEY`, `DATABASE_URL`, and `ALLOWED_ORIGINS`.
3. Deploy the React frontend using the public backend URL as `VITE_API_URL`.
4. Open the public URL and confirm login, dashboard, analytics, predictions, alerts, incidents, reports, and RAG/LLM functions.
5. Start `python -m agent.sensor` on an authorized monitored endpoint.
6. Generate normal authorized network activity on that endpoint.
7. Confirm new remote predictions appear in Prediction History and WebSocket-powered dashboard views.
8. Confirm malicious classifications create Alerts and can be promoted into Incident workflows.
9. Stop the sensor with Ctrl+C and confirm local capture terminates cleanly.
