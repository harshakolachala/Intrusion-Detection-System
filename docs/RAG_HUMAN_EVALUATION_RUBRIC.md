# FedSentry RAG/LLM Human Evaluation Rubric

Use this rubric only after the retrieval test suite passes. Human evaluation measures the generated analyst response, not just whether relevant chunks were retrieved.

## Recommended protocol

- Use 25-50 representative SOC questions.
- Include DDoS, PortScan, brute-force, botnet, web attacks, mitigation, incident triage and FedSentry-specific questions.
- Use at least two independent reviewers.
- Hide model/provider identity during scoring when possible.
- Record exact prompt, retrieved sources, generated answer and model configuration.

## Scoring dimensions

Score each dimension from 1 to 5.

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| Factual correctness | materially incorrect | mostly correct with minor issues | correct and technically precise |
| Grounding | unsupported claims dominate | mixed support | claims clearly supported by retrieved evidence |
| Mitigation usefulness | unsafe/vague/unhelpful | partially actionable | concrete, relevant and operationally useful |
| Relevance | mostly off-topic | addresses core question | focused and complete |
| Hallucination control | fabricated details/sources | some unsupported detail | no meaningful unsupported claims |
| Clarity | confusing | understandable | concise, structured and analyst-friendly |

## Derived metrics

Report:

- mean score ± standard deviation for each dimension
- overall mean score
- percentage of answers with hallucination-control score >= 4
- percentage of answers with factual-correctness score >= 4
- inter-rater agreement (at minimum raw agreement; preferably Cohen's kappa or ICC depending on scoring design)

## Evaluation CSV columns

```text
case_id,reviewer_id,query,provider,model,factual_correctness,grounding,mitigation_usefulness,relevance,hallucination_control,clarity,notes
```

Do not claim that the RAG layer improves analyst productivity unless a separate task-time or user study measures that outcome.
