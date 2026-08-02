from sentence_transformers import SentenceTransformer

from loader import DocumentLoader
from chunker import DocumentChunker


class DocumentEmbedder:
    """
    Generates embeddings for document chunks using a Sentence Transformer.
    """

    def __init__(self):
        print("Loading embedding model...")

        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        print("Embedding model loaded successfully!")

    def create_embeddings(self, chunks):

        embeddings = self.model.encode(
            [chunk["content"] for chunk in chunks],
            convert_to_numpy=True
        )

        results = []

        for chunk, embedding in zip(chunks, embeddings):

            results.append({
                "filename": chunk["filename"],
                "content": chunk["content"],
                "embedding": embedding
            })

        return results


if __name__ == "__main__":

    loader = DocumentLoader()

    docs = loader.load_documents()

    chunker = DocumentChunker(chunk_size=300)

    chunks = chunker.chunk_documents(docs)

    embedder = DocumentEmbedder()

    vectors = embedder.create_embeddings(chunks)

    print()

    print(f"Generated embeddings for {len(vectors)} chunks")

    print()

    print("Embedding Dimension :", len(vectors[0]["embedding"]))