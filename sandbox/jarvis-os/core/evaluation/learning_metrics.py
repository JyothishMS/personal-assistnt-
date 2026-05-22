"""
JARVIS-OS Learning Metrics Tracker
Calculates indicators of adaptive improvement over time, comparing historic success profiles to evaluate cognitive alignment.
"""
import os
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LearningMetrics")


class LearningMetrics:
    """Manages files tracking adaptive gains, routine automation levels, and conversational alignment."""

    def __init__(self, metrics_file: str = "./database/learning_data.json"):
        self.metrics_file = os.path.abspath(metrics_file)
        os.makedirs(os.path.dirname(self.metrics_file), exist_ok=True)
        self.stats = self._load_data()

    def _load_data(self) -> Dict[str, Any]:
        if os.path.exists(self.metrics_file):
            try:
                with open(self.metrics_file, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        
        # Fresh baseline blueprint
        return {
            "initial_success_rate": 80.0,
            "current_success_rate": 80.0,
            "adaptation_gain_index": 0.0,
            "accumulated_routines_automated": 0,
            "habits_registered": 0,
            "learning_curve_history": []
        }

    def _save_data(self):
        try:
            with open(self.metrics_file, "w") as f:
                json.dump(self.stats, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to commit learning metrics metrics: {e}")

    def record_learning_epoch(self, current_real_success_rate: float, routines_count: int, habit_count: int):
        """Processes adaptive gains compared to initial reference configurations."""
        self.stats["current_success_rate"] = current_real_success_rate
        self.stats["accumulated_routines_automated"] = routines_count
        self.stats["habits_registered"] = habit_count

        # Compute positive translation
        initial = self.stats["initial_success_rate"]
        gain = current_real_success_rate - initial
        self.stats["adaptation_gain_index"] = round(max(gain, 0.0), 1)

        epoch_record = {
            "timestamp": os.times()[4] if hasattr(os, 'times') else 0.0,
            "success_rate": round(current_real_success_rate, 1),
            "routines_count": routines_count,
            "habit_count": habit_count,
            "gain": round(gain, 1)
        }
        self.stats["learning_curve_history"].append(epoch_record)
        # Keep list reasonably short
        if len(self.stats["learning_curve_history"]) > 50:
            self.stats["learning_curve_history"].pop(0)

        self._save_data()
        logger.info(f"Recorded learning metrics checkpoint. Current gain index: +{self.stats['adaptation_gain_index']}%")

    def get_summary_report(self) -> Dict[str, Any]:
        """Provides the current statistical adaptation outline."""
        return {
            "gain_index_percent": self.stats.get("adaptation_gain_index", 0.0),
            "routines_detected_count": self.stats.get("accumulated_routines_automated", 0),
            "learned_preferences_count": self.stats.get("habits_registered", 0),
            "base_operational_accuracy": self.stats.get("initial_success_rate", 80.0),
            "current_operational_accuracy": self.stats.get("current_success_rate", 80.0)
        }


if __name__ == "__main__":
    lm = LearningMetrics("./database/test_learning.json")
    lm.record_learning_epoch(94.5, 3, 5)
    print(lm.get_summary_report())
    if os.path.exists("./database/test_learning.json"):
        os.remove("./database/test_learning.json")
