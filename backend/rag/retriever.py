import pickle

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


class Retriever:
    """
    Retrieves the most relevant document chunks using FAISS.
    """

    def __init__(self):

        print("Loading vector database...")

        self.index = faiss.read_index(
            "rag/vector_db/faiss.index"
        )

        with open(
            "rag/vector_db/metadata.pkl",
            "rb"
        ) as f:

            self.metadata = pickle.load(f)

        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        print("Retriever Ready!")

    def search(self, query, top_k=3):

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