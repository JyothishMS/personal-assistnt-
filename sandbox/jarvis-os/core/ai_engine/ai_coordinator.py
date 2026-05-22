"""
JARVIS-OS AI Coordinator Engine
Integrates directly with local Ollama or llama.cpp API structures.
"""
import sys
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AICoordinator")


class AICoordinator:
    """Manages system instruction structures, switches models, and handles Ollama queries."""

    def __init__(self, primary_model: str = "llama3:8b", coder_model: str = "deepseek-coder:6.7b"):
        self.primary_model = primary_model
        self.coder_model = coder_model
        self.system_prompt = (
            "You are JARVIS-OS, the sovereign local background operating daemon for the client laptop.\n"
            "Keep verbal explanations polite, brief, and highly functional. "
            "You have direct system capabilities in sandbox boundaries. Protect security above all."
        )
        logger.info(f"AI Coordinator online. Primary model designated: {self.primary_model}")

    def query_ollama(self, prompt: str, conversation_history: List[Dict[str, str]] = None, use_coder_model: bool = False) -> str:
        """Sends inference request to the local active Ollama daemon port if accessible."""
        model_name = self.coder_model if use_coder_model else self.primary_model
        logger.info(f"Querying regional local LLM model='{model_name}'...")

        try:
            import ollama
            # Form message payload
            messages = [{"role": "system", "content": self.system_prompt}]
            if conversation_history:
                messages.extend(conversation_history)
            messages.append({"role": "user", "content": prompt})

            response = ollama.chat(model=model_name, messages=messages)
            return response.get("message", {}).get("content", "")
        except (ImportError, Exception) as e:
            # High quality fallback simulated response when Ollama client is mock-running
            logger.warning(f"Ollama local instance link inactive. Triggering client diagnostic callback: {e}")
            return (
                f"[JARVIS Offline Heuristic Mode] Registered intent for your statement: '{prompt}'.\n"
                f"Please verify Ollama setup is active on localhost:11434 with '{model_name}' model pulled."
            )

    def load_model(self, model_name: str) -> bool:
        """Instructs Ollama daemon to keep specified models preloaded in memory."""
        logger.info(f"Issuing model load demand to Ollama container: '{model_name}'")
        try:
            import ollama
            # Pulling/loading ensures warm startup times
            ollama.pull(model_name)
            return True
        except Exception:
            return False

    def get_ollama_status(self) -> dict:
        """Queries local port metadata to check loaded memory sizes."""
        status = {"active": False, "models_loaded": []}
        try:
            import ollama
            models_list = ollama.list()
            status["active"] = True
            status["models_loaded"] = [m.get("model") for m in models_list.get("models", [])]
        except Exception:
            status["active"] = False
            status["error_details"] = "Offline: Connection refused on http://127.0.0.1:11434"
        return status


if __name__ == "__main__":
    ai = AICoordinator()
    print("Ollama State:", ai.get_ollama_status())
    print("Test Query Response:", ai.query_ollama("Hello, introduce yourself briefly."))
