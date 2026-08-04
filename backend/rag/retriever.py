import os
import pickle

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


class Retriever:
    """
    Retrieves the most relevant document chunks using FAISS.
    """

    def __init__(self):

        self.index = None
        self.metadata = None
        self.model = None

    def _load(self):
        """Lazy load — only loads when actually needed."""

        if self.index is not None:
            return

        index_path = "rag/vector_db/faiss.index"
        metadata_path = "rag/vector_db/metadata.pkl"

        if not os.path.exists(index_path) or not os.path.exists(metadata_path):
            print("Vector database not found. RAG features will be unavailable.")
            return

        print("Loading vector database...")

        self.index = faiss.read_index(index_path)

        with open(metadata_path, "rb") as f:
            self.metadata = pickle.load(f)

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        print("Retriever Ready!")

    def search(self, query, top_k=3):

        self._load()

        if self.index is None:
            return [{"content": "RAG knowledge base is not available.", "filename": ""}]

        query_embedding = self.model.encode(
            [query],
            convert_to_numpy=True
        ).astype(np.float32)

        distances, indices = self.index.search(
            query_embedding,
            top_k
        )

        results = []

        for idx in indices[0]:

            results.append(
                self.metadata[idx]
            )

        return results


if __name__ == "__main__":

    retriever = Retriever()

    results = retriever.search(
        "What is a DDoS attack?"
    )

    print()

    for i, result in enumerate(results, 1):

        print(f"Result {i}")

        print(result["filename"])

        print(result["content"][:200])

        print("-" * 60)
