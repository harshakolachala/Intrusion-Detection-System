import os
import pickle

import faiss
import numpy as np

from loader import DocumentLoader
from chunker import DocumentChunker
from embedder import DocumentEmbedder


class VectorStore:
    """
    Creates and stores a FAISS vector database.
    """

    def __init__(self):

        self.index = None
        self.metadata = []

        os.makedirs("rag/vector_db", exist_ok=True)

    def build_index(self):

        print("Loading documents...")

        loader = DocumentLoader()

        documents = loader.load_documents()

        print(f"Loaded {len(documents)} documents")

        print("Chunking documents...")

        chunker = DocumentChunker(chunk_size=300)

        chunks = chunker.chunk_documents(documents)

        print(f"Generated {len(chunks)} chunks")

        print("Generating embeddings...")

        embedder = DocumentEmbedder()

        vectors = embedder.create_embeddings(chunks)

        embeddings = np.array(
            [v["embedding"] for v in vectors],
            dtype="float32"
        )

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatL2(dimension)

        self.index.add(embeddings)

        self.metadata = vectors

        faiss.write_index(
            self.index,
            "rag/vector_db/faiss.index"
        )

        with open(
            "rag/vector_db/metadata.pkl",
            "wb"
        ) as f:

            pickle.dump(self.metadata, f)

        print()

        print("Vector database created successfully!")

        print(f"Vectors Stored : {self.index.ntotal}")


if __name__ == "__main__":

    store = VectorStore()

    store.build_index()