"""
JARVIS-OS Task Planner
Accepts compound goal directives and decomposes them into a structured queue of sequential action steps, Complete with dependencies.
"""
import re
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CognitionPlanner")


class CognitionPlanner:
    """Analyzes requirements to yield logical, ordered action steps schemas."""

    def __init__(self):
        logger.info("Cognition Planner initialised. Task graphs decomposition enabled.")

    def construct_plan(self, complex_goal: str) -> List[Dict[str, Any]]:
        """Splits multi-goal user directives into structured step schemas with unique ID links."""
        raw_splits = self._clean_splits(complex_goal)
        plan_steps = []
        
        for idx, statement in enumerate(raw_splits):
            step_id = idx + 1
            step_uuid = f"step_{step_id}"
            
            # Map semantic query statements down to standard action tags
            action_guessed = self._infer_action_tag(statement)
            
            # Define dependencies: Step N depends on Step N-1 (Simple sequence chain)
            dependencies = [f"step_{idx}"] if idx > 0 else []

            plan_steps.append({
                "id": step_uuid,
                "order": step_id,
                "statement": statement,
                "inferred_action": action_guessed,
                "dependencies": dependencies,
                "status": "pending",  # pending | executing | success | failed
                "checks_count": 0,
                "rollback_rollback_action": self._infer_rollback_action(action_guessed, statement)
            })

        logger.info(f"Goal planning solved. Decomposed into {len(plan_steps)} sequential checkpoints.")
        return plan_steps

    def _clean_splits(self, complex_goal: str) -> List[str]:
        """Separates compound natural sentences into independent strings using logical delimiters."""
        # Clean spacing and unify split patterns
        goal_normalized = complex_goal.strip()
        
        # Replace punctuation splits with standard delimiters
        delimiters = [r"\s+and\s+then\s+", r"\s+then\s+", r"\s+and\s+", r";", r"\n"]
        combined_regex = "|".join(delimiters)
        
        parts = re.split(combined_regex, goal_normalized, flags=re.IGNORECASE)
        cleaned = [p.strip() for p in parts if p.strip()]
        
        return cleaned if cleaned else [goal_normalized]

    def _infer_action_tag(self, text: str) -> str:
        """Categorizes raw split tasks based on localized token maps."""
        low = text.lower()
        if any(tok in low for tok in ["create", "write", "make", "generate"]) and "file" in low:
            return "FILE_CREATE"
        elif any(tok in low for tok in ["delete", "remove", "erase"]):
            return "FILE_DELETE"
        elif any(tok in low for tok in ["list", "inspect", "show"]):
            return "LIST_FILES"
        elif any(tok in low for tok in ["organize", "sort", "clean"]):
            return "ORGANIZE_FOLDER"
        elif any(tok in low for tok in ["open", "launch", "run", "start"]):
            return "OPEN_APP"
        return "CONVERSE"

    def _infer_rollback_action(self, action_tag: str, text: str) -> str:
        """Determines corrective or neutralizing actions to apply if a later action fails."""
        # Simple self-healing safety hooks
        if action_tag == "FILE_CREATE":
            # Extract possible filename
            match = re.search(r"file\s+([\w\.-]+)", text, re.IGNORECASE)
            filename = match.group(1) if match else "temp_file_for_rollback_clean.txt"
            return f"delete_file {filename}"
        elif action_tag == "FILE_DELETE":
            # We cannot easily recreate lost content, but we can log caution
            return "log_warning_rollback_limited"
        return "none"


if __name__ == "__main__":
    planner = CognitionPlanner()
    target = "Create file agenda.txt 'Discuss design' and organize downloads then list files"
    p = planner.construct_plan(target)
    import json
    print(json.dumps(p, indent=2))
