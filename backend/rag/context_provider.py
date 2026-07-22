"""
Single entry point the LLM/explain layer uses to get retrieved context.

Integration contract with Hasini's retriever (backend/rag/retriever.py):
    She should expose a function with this signature:

        def retrieve(query: str, top_k: int = 3) -> list[str]

    (a list of plain-text chunks, most relevant first). As soon as that
    module exists and exposes `retrieve`, this file will use it automatically
    -- no changes needed on Rohith's side. Until then, it falls back to the
    local static knowledge base so /chatbot/explain works standalone today.
"""

import logging
from typing import List

from rag.knowledge_base import get_local_context

logger = logging.getLogger("rag.context_provider")

_real_retrieve = None
try:
    # Hasini's module, once merged, should live at backend/rag/retriever.py
    from rag.retriever import retrieve as _real_retrieve  # type: ignore
    logger.info("Using ChromaDB retriever from rag.retriever")
except ImportError:
    logger.info("rag.retriever not found yet -- using local knowledge_base fallback")


def get_context(attack_type: str, top_k: int = 3) -> List[str]:
    """Return top_k reference snippets relevant to the given attack type."""
    if _real_retrieve is not None:
        try:
            query = f"{attack_type} network intrusion attack detection explanation"
            results = _real_retrieve(query, top_k=top_k)
            if results:
                return results
        except Exception as exc:  # noqa: BLE001 - never let RAG errors break /explain
            logger.warning("rag.retriever.retrieve failed (%s); falling back to local KB", exc)

    return get_local_context(attack_type, top_k=top_k)
