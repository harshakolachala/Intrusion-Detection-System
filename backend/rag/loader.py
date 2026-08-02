from pathlib import Path


class DocumentLoader:
    """
    Loads all markdown documents from the RAG knowledge base.
    """

    def __init__(self, document_path="rag/documents"):
        self.document_path = Path(document_path)

    def load_documents(self):

        documents = []

        if not self.document_path.exists():
            print("Document folder not found.")
            return documents

        for file in self.document_path.glob("*.md"):

            with open(file, "r", encoding="utf-8") as f:

                documents.append({
                    "filename": file.name,
                    "content": f.read()
                })

        return documents


if __name__ == "__main__":

    loader = DocumentLoader()

    docs = loader.load_documents()

    print(f"Loaded {len(docs)} documents")

    for doc in docs:
        print(doc["filename"])