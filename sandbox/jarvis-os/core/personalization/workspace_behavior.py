"""
JARVIS-OS Personalization Workspace Behavior Tracker
Monitors active file directories accesses and touch times, defining personal working schedule frames.
"""
import os
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WorkspaceBehavior")


class WorkspaceBehavior:
    """Collects indicators of standard interactive workspaces, tracking touched locations."""

    def __init__(self, behavior_file: str = "./database/workspace_activity.json"):
        self.file_path = os.path.abspath(behavior_file)
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        self.registry = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        
        return {
            "most_accessed_files": {},
            "hourly_activity_distribution": {str(h): 0 for h in range(24)},
            "active_work_schedules": "Standard Daytime Schedule"
        }

    def save(self):
        try:
            with open(self.file_path, "w") as f:
                json.dump(self.registry, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to record behavior: {e}")

    def track_file_access(self, file_path_rel: str):
        """Increments specific files access metrics."""
        files = self.registry.setdefault("most_accessed_files", {})
        files[file_path_rel] = files.get(file_path_rel, 0) + 1
        self.save()

    def log_activity_now(self, hour: int):
        """Maps active work schedules by tracking execution timestamp patterns."""
        dist = self.registry.setdefault("hourly_activity_distribution", {str(h): 0 for h in range(24)})
        hour_str = str(hour)
        dist[hour_str] = dist.get(hour_str, 0) + 1

        # Analyze active work schedule bracket
        total_runs = sum(dist.values())
        if total_runs > 5:
            # Simple morning vs evening weight check
            morning_hits = sum(dist.get(str(h), 0) for h in range(6, 15))
            evening_hits = sum(dist.get(str(h), 0) for h in range(15, 24))
            
            if morning_hits > evening_hits:
                self.registry["active_work_schedules"] = "Morning Productivity Period (07:00 - 15:00)"
            else:
                self.registry["active_work_schedules"] = "Evening / Night Shift Period (15:00 - 23:00)"

        self.save()


if __name__ == "__main__":
    wb = WorkspaceBehavior("./database/test_behavior.json")
    wb.track_file_access("main.cpp")
    wb.log_activity_now(21)
    print(wb.registry)
