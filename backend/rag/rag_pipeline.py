from rag.retriever import Retriever


class RAGPipeline:
    """
    Retrieval-Augmented Generation Pipeline.

    Retrieves the most relevant cybersecurity knowledge
    for a given query.
    """

    def __init__(self):

        self.retriever = Retriever()

    def get_context(self, query, top_k=3):

        results = self.retriever.search(
            query,
            top_k=top_k
        )

        snippets = []

        for result in results:

            snippets.append(result["content"])

        return snippets

    def get_sources(self, query, top_k=3):

        results = self.retriever.search(
            query,
            top_k=top_k
        )

        return [
            result["filename"]
            for result in results
        ]


if __name__ == "__main__":

    rag = RAGPipeline()

    snippets = rag.get_context(
        "Explain DDoS attack"
    )

    print("\nRetrieved Context\n")

    print("-" * 50)

    for i, snippet in enumerate(snippets, 1):

        print(f"\nSnippet {i}\n")

        print(snippet)

        print("-" * 50)