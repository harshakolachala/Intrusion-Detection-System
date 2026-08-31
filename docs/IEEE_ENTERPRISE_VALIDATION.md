# FedSentry IEEE + Enterprise Validation Protocol

This document defines the evidence required before FedSentry is described as IEEE-ready and mid-to-advanced enterprise-ready. It separates **implemented capability** from **measured research evidence**.

## 1. Research questions

RQ1. How close can federated IDS performance remain to the centralized baseline while raw client traffic stays local?

RQ2. How much does statistically heterogeneous (non-IID) client traffic affect accuracy, weighted F1 and macro F1?

RQ3. What communication cost is incurred by FedAvg across clients and communication rounds?

RQ4. Does class-weighted training improve minority-class recall, and what precision/false-positive cost does it introduce?

RQ5. Can the deployed model serve predictions within a practical real-time SOC latency budget?

RQ6. Does the RAG layer consistently retrieve relevant security evidence for analyst questions?

## 2. Mandatory experiment matrix

Run the same model/data protocol under both partitions and at least three independent random seeds.

| Experiment | Partition | Seeds | Clients | Rounds | Local epochs |
|---|---|---:|---:|---:|---:|
| FL-IID | IID | 42, 52, 62 | 3 | 10 | 5 |
| FL-non-IID | Dirichlet alpha=0.3 | 42, 52, 62 | 3 | 10 | 5 |

For the final paper, consider five seeds if compute time permits.

## 3. Commands

From `backend/`:

```bash
python -m federated.ieee_experiments --partition both --seeds 42 52 62
python -m federated.research_summary --results results/ieee
python -m rag.evaluate_rag
```

Validate the experiment pipeline quickly before the full CICIDS2017 run:

```bash
python -m federated.ieee_experiments --partition both --seeds 42 --rounds 2 --local-epochs 1 --development --sample-size 100000
```

## 4. Evidence produced automatically

Each federated run saves:

- per-round accuracy
- weighted precision/recall/F1
- macro precision/recall/F1
- train loss
- model size
- communication bytes/MB per round
- cumulative communication MB
- client label distributions
- final confusion matrix
- per-class classification report
- evaluation throughput
- total experiment runtime

`research_summary.py` produces mean ± sample standard deviation across seeds and a paper-ready CSV/Markdown summary.

## 5. RAG evaluation

`rag.evaluate_rag` evaluates retrieval, not subjective LLM answer quality. It records:

- non-empty retrieval rate
- expected evidence/source hit
- retrieval latency
- RAG subsystem status

For IEEE publication, add a human evaluation set of at least 25-50 security questions. Two reviewers should score factual correctness, grounding, mitigation usefulness and hallucination on a documented rubric. Do not claim improved analyst performance without that evidence.

## 6. Enterprise validation

Before final release validate:

- `/health/live` returns process liveness
- `/health/ready` verifies database readiness
- API responses include security headers and `X-Request-ID`
- JWT-protected routes reject unauthenticated access
- engine Start/Stop controls actual packet capture and worker lifecycle
- no captured-packet count increases after engine Stop
- alerts, incidents, audit logs and predictions persist correctly
- CSV/PDF reports open correctly and contain current database values
- notification bell reflects latest alerts
- profile data persists across logout/login
- light/dark modes remain readable across every protected page
- WebSocket reconnect/fallback behavior is verified
- secrets exist only in local environment configuration

## 7. Final end-to-end scenario

1. Register/login.
2. Confirm readiness endpoint.
3. Start detection engine.
4. Generate normal network traffic.
5. Confirm packet count and predictions increase.
6. Trigger/use a known test flow where appropriate.
7. Confirm alert/incident workflow.
8. Confirm Dashboard and Analytics update.
9. Ask the AI Assistant for grounded explanation/mitigation.
10. Export alerts/predictions/incidents CSV.
11. Generate security-summary and incident PDF reports.
12. Stop engine.
13. Wait at least 10 seconds and verify packet count is unchanged, worker is stopped, active flows are zero and queue is empty.
14. Log out/in and confirm profile persistence.

## 8. Paper update gates

Do not replace the current paper numbers until the new experiments actually finish. After execution, update:

- Abstract with mean ± standard deviation where relevant
- Experimental Setup with IID/non-IID protocol and random seeds
- Results with IID vs non-IID comparison
- Communication-overhead table
- Statistical stability table
- RAG evaluation subsection
- Limitations with measured rather than assumed behavior
- references that still contain placeholders

## 9. Claims to avoid until measured

Do not claim secure aggregation, differential privacy, production multi-organization federation, statistically significant RAG analyst improvement, or end-to-end packet-to-alert latency unless those capabilities have been implemented and experimentally measured.
