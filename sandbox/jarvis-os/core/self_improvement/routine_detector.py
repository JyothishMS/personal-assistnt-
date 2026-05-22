"""
JARVIS-OS Routine Detector
Scans historical operation arrays in SQLite to extract high-confidence sequence patterns and suggest macro automations.
"""
import os
import sqlite3
import logging
from typing import List, Dict, Any, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RoutineDetector")


class RoutineDetector:
    """Analyzes command histories using temporal sliding windows to pinpoint repeated workflows."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db"):
        self.db_path = db_path

    def _get_connection(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def analyze_history_for_patterns(self, command_history_window: List[str] = None) -> List[Dict[str, Any]]:
        """Parses recent operations to detect repeating command chains."""
        commands = command_history_window if command_history_window is not None else self._retrieve_recent_commands_list()
        
        if len(commands) < 3:
            return []

        detected_routines = []
        # Look for window matching patterns (size 2 or 3 repeating sequences)
        sequence_size = 3
        frequency_map: Dict[Tuple[str, ...], int] = {}

        for i in range(len(commands) - sequence_size + 1):
            sub_seq = tuple(commands[i:i + sequence_size])
            # Filter trivial conversational sequences
            if any(cmd == "converse" or not cmd for cmd in sub_seq):
                continue
            frequency_map[sub_seq] = frequency_map.get(sub_seq, 0) + 1

        for seq, count in frequency_map.items():
            if count >= 2:  # Found repeating routine pattern!
                routine_name = "Custom Development Sequence"
                if any("code" in c or "editor" in c for c in seq):
                    routine_name = "Morning software development sequence"
                elif any("clean" in c or "delete" in c for c in seq):
                    routine_name = "Disk optimization routine"
                elif any("file" in c or "create" in c for c in seq):
                    routine_name = "Standard template formulation cycle"

                detected_routines.append({
                    "routine_title": routine_name,
                    "sequence_actions": list(seq),
                    "execution_frequency": count,
                    "confidence_score": min(0.3 + (count * 0.2), 0.99),
                    "auto_recommendation": f"Optionally schedule sequence: {', '.join(seq)}"
                })

        # Sort by frequency descending
        return sorted(detected_routines, key=lambda x: x["execution_frequency"], reverse=True)

    def _retrieve_recent_commands_list(self) -> List[str]:
        items = []
        if not os.path.exists(self.db_path):
            return items
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT recommended_action FROM action_memory ORDER BY id DESC LIMIT 100")
                for row in cursor.fetchall():
                    # Return list chronologically (reverse the DESC fetch)
                    items.append(row[0] or "")
                items.reverse()
        except Exception as e:
            logger.error(f"Failed to query local telemetry: {e}")
        return items


if __name__ == "__main__":
    detector = RoutineDetector("./database/test_routine.db")
    test_seq = [
        "create_file main.cpp", "execute compile", "execute run_gdb",
        "chat_converse",
        "create_file main.cpp", "execute compile", "execute run_gdb",
    ]
    print(detector.analyze_history_for_patterns(test_seq))
