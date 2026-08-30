"""RAG retriever for FedSentry.

The retriever prefers semantic search with SentenceTransformers + FAISS, but it
never requires a pre-generated vector database. If the vector database is
missing it builds an in-memory index from backend/rag/documents. If the
embedding model or FAISS is unavailable, it falls back to deterministic
lexical retrieval so the chatbot still has grounded local context.
"""

from __future__ import annotations

import logging
import os
import pickle
import re
from pathlib import Path
from typing import Dict, List

logger = logging.getLogger("rag.retriever")

RAG_DIR = Path(__file__).resolve().parent
DOCUMENTS_DIR = RAG_DIR / "documents"
VECTOR_DIR = RAG_DIR / "vector_db"
INDEX_PATH = VECTOR_DIR / "faiss.index"
METADATA_PATH = VECTOR_DIR / "metadata.pkl"
EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
RAG_MODE = os.getenv("RAG_MODE", "hybrid").strip().lower()

_TOKEN_RE = re.compile(r"[a-zA-Z0-9_\-]+")


class Retriever:
    """Retrieve relevant FedSentry knowledge-base chunks.

    Modes:
      - hybrid (default): semantic search when available, lexical fallback
      - semantic: semantic search first, lexical fallback if initialization fails
      - lexical: no model download; always use local keyword scoring
    """

    def __init__(self) -> None:
        self.index = None
        self.metadata: List[Dict] = []
        self.model = None
        self._semantic_attempted = False
        self._documents = self._load_document_chunks()

    def _load_document_chunks(self) -> List[Dict]:
        chunks: List[Dict] = []
        if not DOCUMENTS_DIR.exists():
            logger.warning("RAG document directory does not exist: %s", DOCUMENTS_DIR)
            return chunks

        for path in sorted(DOCUMENTS_DIR.glob("*.md")):
            try:
                text = path.read_text(encoding="utf-8").strip()
            except OSError as exc:
                logger.warning("Unable to read RAG document %s: %s", path, exc)
                continue

            if not text:
                continue

            # Use overlapping paragraph-sized chunks without adding another dependency.
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
            current = ""
            for paragraph in paragraphs:
                candidate = f"{current}\n\n{paragraph}".strip() if current else paragraph
                if len(candidate) <= 900:
                    current = candidate
                    continue
                if current:
                    chunks.append({"filename": path.name, "content": current})
                current = paragraph
            if current:
                chunks.append({"filename": path.name, "content": current})

        return chunks

    def _initialize_semantic(self) -> bool:
        if self.index is not None and self.model is not None and self.metadata:
            return True
        if self._semantic_attempted:
            return False
        self._semantic_attempted = True

        if RAG_MODE == "lexical":
            return False

        try:
            import faiss
            import numpy as np
            from sentence_transformers import SentenceTransformer

            self.model = SentenceTransformer(EMBEDDING_MODEL)

            if INDEX_PATH.exists() and METADATA_PATH.exists():
                try:
                    self.index = faiss.read_index(str(INDEX_PATH))
                    with METADATA_PATH.open("rb") as handle:
                        self.metadata = pickle.load(handle)
                    if self.metadata and self.index.ntotal == len(self.metadata):
                        logger.info("Loaded FedSentry RAG vector index with %s chunks.", self.index.ntotal)
                        return True
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Existing RAG vector index is invalid; rebuilding in memory: %s", exc)
                    self.index = None
                    self.metadata = []

            if not self._documents:
                logger.warning("No RAG documents are available for semantic indexing.")
                return False

            texts = [item["content"] for item in self._documents]
            vectors = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            vectors = np.asarray(vectors, dtype="float32")

            self.index = faiss.IndexFlatIP(vectors.shape[1])
            self.index.add(vectors)
            self.metadata = list(self._documents)
            logger.info("Built FedSentry RAG vector index in memory with %s chunks.", self.index.ntotal)
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("Semantic RAG unavailable; using lexical retrieval: %s", exc)
            self.index = None
            self.model = None
            self.metadata = []
            return False

    @staticmethod
    def _tokens(text: str) -> set[str]:
        return {token.lower() for token in _TOKEN_RE.findall(text) if len(token) > 1}

    def _lexical_search(self, query: str, top_k: int) -> List[Dict]:
        if not self._documents:
            return []

        query_tokens = self._tokens(query)
        query_lower = query.lower().strip()
        scored = []

        for item in self._documents:
            content_lower = item["content"].lower()
            filename_lower = item["filename"].lower().replace("_", " ")
            content_tokens = self._tokens(item["content"])

            overlap = len(query_tokens & content_tokens)
            phrase_bonus = 6 if query_lower and query_lower in content_lower else 0
            filename_bonus = sum(3 for token in query_tokens if token in filename_lower)
            score = overlap + phrase_bonus + filename_bonus
            scored.append((score, item))

        scored.sort(key=lambda pair: pair[0], reverse=True)
        positive = [item for score, item in scored if score > 0]
        if positive:
            return positive[:top_k]
        return [item for _, item in scored[:top_k]]

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        query = (query or "").strip()
        if not query:
            return []

        top_k = max(1, min(int(top_k), 10))

        if self._initialize_semantic():
            try:
                import numpy as np

                query_embedding = self.model.encode(
                    [query],
                    convert_to_numpy=True,
                    normalize_embeddings=True,
                )
                query_embedding = np.asarray(query_embedding, dtype="float32")
                _, indices = self.index.search(query_embedding, top_k)

                results: List[Dict] = []
                for idx in indices[0]:
                    if 0 <= int(idx) < len(self.metadata):
                        item = self.metadata[int(idx)]
                        results.append({
                            "filename": item.get("filename", "knowledge-base"),
                            "content": item.get("content", ""),
                        })
                if results:
                    return results
            except Exception as exc:  # noqa: BLE001
                logger.warning("Semantic RAG query failed; using lexical fallback: %s", exc)

        return self._lexical_search(query, top_k)

    def status(self) -> Dict[str, object]:
        return {
            "mode": RAG_MODE,
            "documents": len(self._documents),
            "semantic_ready": bool(self.index is not None and self.model is not None),
            "embedding_model": EMBEDDING_MODEL,
        }


if __name__ == "__main__":
    retriever = Retriever()
    for i, result in enumerate(retriever.search("What is a DDoS attack?"), 1):
        print(f"Result {i}: {result['filename']}")
        print(result["content"][:300])
        print("-" * 60)
