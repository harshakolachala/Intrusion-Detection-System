from retriever import Retriever


class RAGPipeline:
    """
    Retrieval-Augmented Generation pipeline.
    Retrieves relevant context from the knowledge base.
    """

    def __init__(self):

        self.retriever = Retriever()

    def get_context(self, query):

        results = self.retriever.search(
            query,
            top_k=3
        )

        context = ""

        for result in results:

            context += (
                f"\nSource: {result['filename']}\n"
                f"{result['content']}\n"
            )

        return context


if __name__ == "__main__":

    rag = RAGPipeline()

    context = rag.get_context(
        "Explain DDoS attack"
    )

    print()

    print("Retrieved Context")

    print("-" * 50)

    print(context)