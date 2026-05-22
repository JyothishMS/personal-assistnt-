"""
JARVIS-OS Preference Learning Engine
Examines natural language user inputs to extract implicit stylistic preferences and commit them to preferences SQL tables.
"""
import re
import logging
from typing import Dict, Any, List

from core.memory_engine.memory_engine import MemoryEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PreferenceLearning")


class PreferenceLearning:
    """Extracts preference patterns from chat sessions and preserves them locally for personalized model inputs."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db"):
        self.memory = MemoryEngine(db_path)

    def harvest_preferences_from_text(self, sender: str, text: str) -> Dict[str, String] if False else Dict[str, Any]:
        """Scans chat strings for emotional markers, tool claims, and schedule declarations."""
        if sender != "user":
            return {}

        text_low = text.lower()
        extracted = {}

        # 1. Preferred coding editors
        editors_map = {
            "vscode": "VS Code", "visual studio code": "VS Code",
            "vim": "Vim", "nano": "Nano", "sublime": "Sublime Text",
            "emacs": "Emacs"
        }
        for kw, editor in editors_map.items():
            if f"use {kw}" in text_low or f"prefer {kw}" in text_low or f"love {kw}" in text_low:
                extracted["preferred_ide"] = editor
                self.memory.set_preference("preferred_ide", editor)
                logger.info(f"Learned preference 'preferred_ide': {editor}")

        # 2. Preferred folder locations
        folder_match = re.search(r"(?:in|to|inside)\s+folder\s+['\"]?([\w_-]+)['\"]?", text_low)
        if folder_match:
            folder = folder_match.group(1)
            extracted["preferred_workspace"] = folder
            self.memory.set_preference("preferred_workspace", folder)
            logger.info(f"Learned preference 'preferred_workspace': {folder}")

        # 3. Work schedules preferences
        if "working hour" in text_low or "night shift" in text_low or "coding schedule":
            if "night" in text_low or "dark mood" in text_low:
                extracted["preferred_theme"] = "dark"
                self.memory.set_preference("preferred_theme", "dark")
            elif "morning" in text_low or "light mood" in text_low:
                extracted["preferred_theme"] = "light"
                self.memory.set_preference("preferred_theme", "light")

        return extracted


if __name__ == "__main__":
    pl = PreferenceLearning("./database/test_pref.db")
    pl.harvest_preferences_from_text("user", "Please write this down inside the projects folder and i prefer VS Code for everything.")
    import shutil
    shutil.rmtree("./database", ignore_errors=True)
