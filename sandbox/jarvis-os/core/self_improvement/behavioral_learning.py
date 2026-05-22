"""
JARVIS-OS Behavioral Learning Engine
Monitors user commands sequences to formalize automated shortcuts, reducing prompt latency.
"""
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BehavioralLearning")


class BehavioralLearning:
    """Encapsulates system habits recognition to yield dynamic automation macro proposals."""

    def __init__(self):
        # Local short term cache of live actions
        self.shortcut_threshold = 3
        self.session_actions: List[str] = []

    def record_run_and_predict_shortcut(self, last_command_run: str) -> Dict[str, Any]:
        """Examines last execute patterns to check if user repeats actions, returning self-improvement advice."""
        self.session_actions.append(last_command_run.strip())
        if len(self.session_actions) > 20:
            self.session_actions.pop(0)

        # Counting occurrences in slice
        occurrences = sum(1 for c in self.session_actions if c == last_command_run)
        
        if occurrences >= self.shortcut_threshold:
            logger.info(f"BEHAVIOR DETECTED: Command '{last_command_run}' executed {occurrences} times during session. Suggesting shortcut mapping.")
            return {
                "shortcut_recommended": True,
                "command": last_command_run,
                "suggested_alias": f"quick_{last_command_run.split()[0]}",
                "explanation": f"Frequently executed. Automating this sequence will save keypresses."
            }

        return {
            "shortcut_recommended": False,
            "command": last_command_run,
            "explanation": "No frequent pattern threshold reached yet."
        }


if __name__ == "__main__":
    bl = BehavioralLearning()
    for _ in range(4):
        print(bl.record_run_and_predict_shortcut("create_file output.md"))
