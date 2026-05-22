"""
JARVIS-OS Personalization User Profile
Stores personal operating properties, productivity habits, and preferred applications locally nearby.
"""
import os
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("UserProfile")


class UserProfile:
    """Provides file persistent APIs to manage local context variables without external dependencies."""

    def __init__(self, profile_file: str = "./database/user_profile.json"):
        self.profile_file = os.path.abspath(profile_file)
        os.makedirs(os.path.dirname(self.profile_file), exist_ok=True)
        self.data = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(self.profile_file):
            try:
                with open(self.profile_file, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        
        # Default fresh local properties
        return {
            "username": "Operator",
            "preferred_apps": ["VS Code", "Terminal", "Chrome", "Ollama"],
            "preferred_workspace_directories": ["./sandbox/workspace", "./sandbox/projects"],
            "active_schedules_bracket": "09:00 - 18:00",
            "weekly_productivity_index_score": 100,
            "frequently_used_commands_frequency": {}
        }

    def save(self):
        try:
            with open(self.profile_file, "w") as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist profile configuration: {e}")

    def update_profile_field(self, field: str, value: Any):
        """Standard property update committing immediately to JSON."""
        self.data[field] = value
        self.save()
        logger.info(f"User Profile field updated '{field}': {value}")

    def increment_command_frequency(self, command_base: str):
        """Monitors productivity habits by incrementing command execution metrics."""
        freqs = self.data.setdefault("frequently_used_commands_frequency", {})
        freqs[command_base] = freqs.get(command_base, 0) + 1
        self.save()


if __name__ == "__main__":
    profile = UserProfile("./database/test_profile.json")
    profile.update_profile_field("username", "John Doe")
    profile.increment_command_frequency("create_file")
    print(profile.data)
