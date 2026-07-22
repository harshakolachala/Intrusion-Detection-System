"""
LLM explanation generation.

Provider is chosen via the LLM_PROVIDER env var ("groq" or "gemini").
Groq is the default because it's fast and free-tier friendly for a class
project; Gemini is kept as a drop-in fallback if Groq is rate-limited or a
key isn't set.

Required env vars (see backend/.env.example):
    LLM_PROVIDER=groq            # or "gemini"
    GROQ_API_KEY=...             # https://console.groq.com/keys
    GROQ_MODEL=llama-3.3-70b-versatile
    GEMINI_API_KEY=...           # https://aistudio.google.com/apikey
    GEMINI_MODEL=gemini-2.0-flash
"""

import os
import logging
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("llm.explainer")

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

SYSTEM_PROMPT = (
    "You are a network security analyst assistant embedded in an intrusion "
    "detection system dashboard. You explain WHY a machine-learning model "
    "flagged a specific piece of network traffic as a given attack type. "
    "Write for a SOC analyst audience: concise, technical, no fluff, no "
    "restating these instructions. Ground your explanation in the provided "
    "model output and reference context -- do not invent CVEs, statistics, "
    "or facts that were not given to you. If the reference context is "
    "generic, say the explanation relies mainly on the flow features. "
    "Respond in 3-5 sentences, plain prose, no markdown headers."
)


def build_prompt(
    attack_type: str,
    confidence: float,
    context_snippets: List[str],
    top_features: Optional[List[dict]] = None,
) -> str:
    """Assemble the user-turn prompt from prediction + retrieved context."""
    context_block = "\n".join(f"- {c}" for c in context_snippets) or "- (no reference material found)"

    features_block = "(not provided)"
    if top_features:
        features_block = "\n".join(
            f"- {f.get('name', 'unknown feature')}: {f.get('value', 'n/a')}"
            for f in top_features
        )

    return (
        f"Model prediction: {attack_type}\n"
        f"Model confidence: {confidence:.1%}\n\n"
        f"Top contributing flow features:\n{features_block}\n\n"
        f"Reference material (from attack knowledge base):\n{context_block}\n\n"
        "Task: In 3-5 sentences, explain to a SOC analyst why this traffic "
        "was most likely flagged as the predicted attack type, tying the "
        "explanation back to the contributing features and reference "
        "material above."
    )


def _generate_with_groq(system_prompt: str, user_prompt: str) -> str:
    from groq import Groq

    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set")

    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()


def _generate_with_gemini(system_prompt: str, user_prompt: str) -> str:
    import google.generativeai as genai

    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL, system_instruction=system_prompt)
    response = model.generate_content(
        user_prompt,
        generation_config={"temperature": 0.3, "max_output_tokens": 300},
    )
    return response.text.strip()


def _rule_based_fallback(attack_type: str, confidence: float, context_snippets: List[str]) -> str:
    """Last-resort explanation if no LLM provider is configured/reachable.

    Keeps /chatbot/explain functional during demos even without API keys.
    """
    ref = context_snippets[0] if context_snippets else ""
    return (
        f"This flow was classified as {attack_type} with {confidence:.1%} confidence. "
        f"{ref} This explanation is a fallback template because no LLM provider "
        "responded -- check LLM_PROVIDER/API keys in backend/.env for a full "
        "generated explanation."
    )


def generate_explanation(
    attack_type: str,
    confidence: float,
    context_snippets: List[str],
    top_features: Optional[List[dict]] = None,
) -> dict:
    """Generate a natural-language explanation for a detection.

    Returns a dict: {"explanation": str, "provider": str}
    Never raises -- always falls back to a template so the API stays up.
    """
    user_prompt = build_prompt(attack_type, confidence, context_snippets, top_features)

    providers_in_order = [LLM_PROVIDER] + [p for p in ("groq", "gemini") if p != LLM_PROVIDER]

    for provider in providers_in_order:
        try:
            if provider == "groq":
                text = _generate_with_groq(SYSTEM_PROMPT, user_prompt)
            elif provider == "gemini":
                text = _generate_with_gemini(SYSTEM_PROMPT, user_prompt)
            else:
                continue
            return {"explanation": text, "provider": provider}
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM provider '%s' failed: %s", provider, exc)
            continue

    return {
        "explanation": _rule_based_fallback(attack_type, confidence, context_snippets),
        "provider": "fallback-template",
    }
