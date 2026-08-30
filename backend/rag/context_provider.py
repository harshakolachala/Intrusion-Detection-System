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

        self.pipeline = None

    def _get_pipeline(self):
        """Lazy load — only creates pipeline when actually needed."""

        if self.pipeline is None:
            self.pipeline = RAGPipeline()

        return self.pipeline

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

            pipeline = self._get_pipeline()

            if pipeline is None:
                return []

            return pipeline.get_context(
                query=query,
                top_k=top_k
            )

        except Exception as e:

            logger.error(
                "RAG retrieval failed: %s",
                e
            )

            return []

    def get_sources(
        self,
        query: str,
        top_k: int = 3
    ) -> List[str]:
        """Return the knowledge-base filenames backing a query's context.

        Used to show citation chips (e.g. "ddos.md") in the chat UI.
        """

        try:

            pipeline = self._get_pipeline()

            if pipeline is None:
                return []

            return pipeline.get_sources(
                query=query,
                top_k=top_k
            )

        except Exception as e:

            logger.error(
                "RAG source lookup failed: %s",
                e
            )

            return []


def get_context(
    attack_type: str,
    top_k: int = 3
) -> List[str]:

    try:
        provider = ContextProvider()
        return provider.get_context(attack_type, top_k)
    except Exception:
        return []


def get_sources(
    query: str,
    top_k: int = 3
) -> List[str]:

    try:
        provider = ContextProvider()
        return provider.get_sources(query, top_k)
    except Exception:
        return []


if __name__ == "__main__":

    context = get_context(
        "DDoS"
    )

    print()

    for i, snippet in enumerate(context, 1):

        print(f"Snippet {i}")

        print(snippet)

        print("-" * 60)
