import logging
from typing import List

from rag.rag_pipeline import RAGPipeline

logger = logging.getLogger("rag.context_provider")


class ContextProvider:
    """
    Provides cybersecurity context for the LLM using
    the Retrieval-Augmented Generation pipeline.
    """

    def __init__(self):

        self.pipeline = RAGPipeline()

    def get_context(
        self,
        attack_type: str,
        top_k: int = 3
    ) -> List[str]:

        query = (
            f"{attack_type} network intrusion "
            f"attack explanation"
        )

        try:

            return self.pipeline.get_context(
                query=query,
                top_k=top_k
            )

        except Exception as e:

            logger.error(
                "RAG retrieval failed: %s",
                e
            )

            return []


provider = ContextProvider()


def get_context(
    attack_type: str,
    top_k: int = 3
) -> List[str]:

    return provider.get_context(
        attack_type,
        top_k
    )


if __name__ == "__main__":

    context = get_context(
        "DDoS"
    )

    print()

    for i, snippet in enumerate(context, 1):

        print(f"Snippet {i}")

        print(snippet)

        print("-" * 60)