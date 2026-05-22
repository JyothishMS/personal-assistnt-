"""
JARVIS-OS Personalization Preference Mapper
Links extracted preferences to user profiles and models system prompts matching learned styles.
"""
import logging
from typing import Dict, Any

from core.personalization.user_profile import UserProfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PreferenceMapper")


class PreferenceMapper:
    """Synchronizes preference inputs to personalize standard system outputs."""

    def __init__(self, profile_path: str = "./database/user_profile.json"):
        self.profile = UserProfile(profile_path)

    def import_preference_key(self, key_name: str, value_data: str):
        """Standardizes preference matches and maps them into profile state fields."""
        normalized_val = value_data.strip()

        if key_name == "preferred_ide":
            self.profile.update_profile_field("editor", normalized_val)
            # Add to preferred apps if not already present
            apps = self.profile.data.get("preferred_apps", [])
            if normalized_val not in apps:
                apps.append(normalized_val)
                self.profile.update_profile_field("preferred_apps", apps)

        elif key_name == "preferred_workspace":
            dirs = self.profile.data.get("preferred_workspace_directories", [])
            if normalized_val not in dirs:
                dirs.append(normalized_val)
                self.profile.update_profile_field("preferred_workspace_directories", dirs)

        elif key_name == "preferred_theme":
            self.profile.update_profile_field("ui_theme_mode", normalized_val)

        logger.info(f"Context variables mapped: '{key_name}' -> '{normalized_val}'")

    def assemble_personalized_prompt_accent(self) -> str:
        """Constructs brief, high-relevance behavioral prompts context matching user profile."""
        p_data = self.profile.data
        username = p_data.get("username", "Operator")
        editor = p_data.get("editor", "VS Code")
        preferred_dirs = p_data.get("preferred_workspace_directories", [])
        fav_dir = preferred_dirs[0] if preferred_dirs else "./sandbox"

        accent = (
            f"Note operator is named '{username}'. "
            f"The operator prefers working with editor '{editor}' within directory '{fav_dir}'."
        )
        return accent


if __name__ == "__main__":
    mapper = PreferenceMapper("./database/test_map_profile.json")
    mapper.import_preference_key("preferred_ide", "Vim")
    print(mapper.assemble_personalized_prompt_accent())
