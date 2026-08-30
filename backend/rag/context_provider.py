"""Shared RAG context provider for the FedSentry assistant."""

import logging
from typing import List

from rag.rag_pipeline import RAGPipeline

logger = logging.getLogger("rag.context_provider")


class ContextProvider:
    """Provide reusable, fault-tolerant knowledge-base retrieval."""

    def __init__(self):
        self.pipeline = None

    def _get_pipeline(self) -> RAGPipeline:
        if self.pipeline is None:
            self.pipeline = RAGPipeline()
        return self.pipeline

    def get_context(self, query: str, top_k: int = 3) -> List[str]:
        try:
            return self._get_pipeline().get_context(query=query, top_k=top_k)
        except Exception as exc:  # noqa: BLE001
            logger.exception("RAG retrieval failed: %s", exc)
            return []

    def get_sources(self, query: str, top_k: int = 3) -> List[str]:
        try:
            return self._get_pipeline().get_sources(query=query, top_k=top_k)
        except Exception as exc:  # noqa: BLE001
            logger.exception("RAG source lookup failed: %s", exc)
            return []

    def status(self) -> dict:
        try:
            pipeline = self._get_pipeline()
            retriever = getattr(pipeline, "retriever", None)
            if retriever and hasattr(retriever, "status"):
                return retriever.status()
            return {"mode": "unknown", "documents": 0, "semantic_ready": False}
        except Exception as exc:  # noqa: BLE001
            return {"mode": "error", "documents": 0, "semantic_ready": False, "error": str(exc)}


_provider = ContextProvider()


def get_context(query: str, top_k: int = 3) -> List[str]:
    return _provider.get_context(query, top_k)


def get_sources(query: str, top_k: int = 3) -> List[str]:
    return _provider.get_sources(query, top_k)


def get_rag_status() -> dict:
    return _provider.status()


if __name__ == "__main__":
    for i, snippet in enumerate(get_context("DDoS mitigation"), 1):
        print(f"Snippet {i}")
        print(snippet)
        print("-" * 60)
