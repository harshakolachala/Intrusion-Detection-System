"""Offline retrieval evaluation for the FedSentry RAG knowledge layer.

This script measures retrieval coverage without calling a paid LLM. Test cases are
stored as JSON and define a query plus expected source-name or keyword evidence.
The output is suitable for an IEEE paper's RAG evaluation subsection.

Example from backend/:
    python -m rag.evaluate_rag
"""

from __future__ import annotations

import argparse
import csv
import json
import time
from pathlib import Path

from rag.context_provider import get_context, get_sources, get_rag_status


DEFAULT_CASES = [
    {
        "id": "syn-flood",
        "query": "What are the indicators and mitigations for a SYN flood attack?",
        "expected_keywords": ["syn", "flood"],
        "expected_sources": ["dos", "ddos"],
    },
    {
        "id": "port-scan",
        "query": "Explain PortScan reconnaissance indicators and defensive actions.",
        "expected_keywords": ["port", "scan"],
        "expected_sources": ["portscan"],
    },
    {
        "id": "botnet",
        "query": "How can a SOC analyst identify and contain botnet traffic?",
        "expected_keywords": ["bot", "botnet"],
        "expected_sources": ["botnet"],
    },
    {
        "id": "brute-force",
        "query": "What evidence suggests a brute-force authentication attack?",
        "expected_keywords": ["brute", "login", "authentication"],
        "expected_sources": [],
    },
    {
        "id": "sql-injection",
        "query": "Explain SQL injection indicators and mitigation guidance.",
        "expected_keywords": ["sql", "injection"],
        "expected_sources": [],
    },
]


def load_cases(path: str | None) -> list[dict]:
    if not path:
        return DEFAULT_CASES
    with Path(path).open("r", encoding="utf-8") as handle:
        cases = json.load(handle)
    if not isinstance(cases, list):
        raise ValueError("RAG evaluation file must contain a JSON list.")
    return cases


def contains_any(text: str, terms: list[str]) -> bool:
    lowered = text.lower()
    return any(term.lower() in lowered for term in terms)


def evaluate_case(case: dict, top_k: int) -> dict:
    started = time.perf_counter()
    context = get_context(case["query"], top_k=top_k)
    sources = get_sources(case["query"], top_k=top_k)
    elapsed_ms = (time.perf_counter() - started) * 1000.0

    joined_context = "\n".join(context)
    joined_sources = "\n".join(sources)
    keyword_terms = list(case.get("expected_keywords", []))
    source_terms = list(case.get("expected_sources", []))

    keyword_hit = contains_any(joined_context, keyword_terms) if keyword_terms else True
    source_hit = contains_any(joined_sources, source_terms) if source_terms else True
    retrieval_success = bool(context) and keyword_hit and source_hit

    return {
        "id": case.get("id", case["query"][:40]),
        "query": case["query"],
        "retrieved_chunks": len(context),
        "retrieved_sources": len(sources),
        "keyword_hit": keyword_hit,
        "source_hit": source_hit,
        "retrieval_success": retrieval_success,
        "latency_ms": elapsed_ms,
        "sources": sources,
        "context_preview": [chunk[:240] for chunk in context],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate FedSentry RAG retrieval quality")
    parser.add_argument("--cases", default=None, help="Optional JSON evaluation set")
    parser.add_argument("--top-k", type=int, default=3)
    parser.add_argument("--output", default="results/rag_evaluation")
    args = parser.parse_args()

    cases = load_cases(args.cases)
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    results = [evaluate_case(case, args.top_k) for case in cases]

    success_rate = sum(row["retrieval_success"] for row in results) / max(len(results), 1)
    mean_latency = sum(row["latency_ms"] for row in results) / max(len(results), 1)
    summary = {
        "rag_status": get_rag_status(),
        "test_cases": len(results),
        "top_k": args.top_k,
        "retrieval_success_rate": success_rate,
        "mean_retrieval_latency_ms": mean_latency,
        "results": results,
        "method_note": (
            "Retrieval success requires non-empty context and the expected keyword/source "
            "evidence defined by the evaluation set. LLM answer quality requires separate "
            "human scoring and is intentionally not inferred from retrieval success."
        ),
    }

    (output / "rag_evaluation.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    with (output / "rag_evaluation.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "id",
                "query",
                "retrieved_chunks",
                "retrieved_sources",
                "keyword_hit",
                "source_hit",
                "retrieval_success",
                "latency_ms",
            ],
        )
        writer.writeheader()
        for row in results:
            writer.writerow({key: row[key] for key in writer.fieldnames})

    print(f"RAG retrieval success: {success_rate * 100:.2f}%")
    print(f"Mean retrieval latency: {mean_latency:.2f} ms")
    print(f"Results written to {output.resolve()}")


if __name__ == "__main__":
    main()
