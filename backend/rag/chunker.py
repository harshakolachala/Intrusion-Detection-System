class DocumentChunker:
    """
    Splits documents into fixed-size text chunks.
    """

    def __init__(self, chunk_size=300):
        self.chunk_size = chunk_size

    def chunk_documents(self, documents):

        chunks = []

        for doc in documents:

            text = doc["content"]

            filename = doc["filename"]

            for i in range(0, len(text), self.chunk_size):

                chunk = text[i:i + self.chunk_size]

                chunks.append({
                    "filename": filename,
                    "content": chunk
                })

        return chunks


if __name__ == "__main__":

    from loader import DocumentLoader

    loader = DocumentLoader()

    docs = loader.load_documents()

    chunker = DocumentChunker(chunk_size=300)

    chunks = chunker.chunk_documents(docs)

    print(f"Total Chunks : {len(chunks)}")

    print()

    print(chunks[0])