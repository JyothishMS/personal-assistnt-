"""
JARVIS-OS Adaptation Engine
Integrates telemetry sub-modules to dynamically mutate operating logic parameters, ensuring high success bounds.
"""
import logging
from typing import Dict, Any, List

from core.evaluation.performance_tracker import PerformanceTracker
from core.evaluation.execution_scoring import ExecutionScoring
from core.evaluation.learning_metrics import LearningMetrics
from core.evaluation.workflow_optimizer import WorkflowOptimizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AdaptationEngine")


class AdaptationEngine:
    """Evaluates metrics and dynamically tunes execution and memory parameters to boost reliability."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db"):
        self.tracker = PerformanceTracker(db_path)
        self.scorer = ExecutionScoring()
        self.metrics = LearningMetrics()
        self.optimizer = WorkflowOptimizer()
        logger.info("Adaptation Engine online. Telemetry evaluation triggers aligned.")

    def analyze_and_adapt_system_policy(self) -> Dict[str, Any]:
        """Runs baseline telemetry snapshots to tune security filters and adaptive backoffs."""
        snapshot = self.tracker.capture_snapshot()
        success_rate = snapshot.get("successful_tasks_percent", 90.0)
        avg_retries = snapshot.get("avg_retries_per_task", 0.0)

        # Mutate system policies depending on actual error ratios
        recommended_backoff = 0.5
        security_level = "STRICT"
        max_attempts_limit = 3

        if success_rate < 75.0 or avg_retries > 1.5:
            # System is struggling! Fallback to highly conservative boundaries
            recommended_backoff = 2.0  # Slow down execution sequences
            security_level = "ULTRA_STRICT"
            max_attempts_limit = 5      # Support deeper auto-repair loops
            logger.warning("TELEMETRY HEAL ALERT: Success rates dipped. Engaged ULTRA_STRICT filters and increased backoff spacings.")
        elif success_rate > 95.0 and avg_retries < 0.2:
            # System is performing nominally at peak speed
            recommended_backoff = 0.2  # Accelerate steps spacing
            security_level = "STRICT_NOMINAL"
            logger.info("TELEMETRY PERFORMANCE NOMINAL: Elevated execution throughput parameters.")

        self.metrics.record_learning_epoch(
            current_real_success_rate=success_rate,
            routines_count=self.metrics.stats.get("accumulated_routines_automated", 0),
            habit_count=self.metrics.stats.get("habits_registered", 0)
        )

        return {
            "telemetry_metrics_summary": snapshot,
            "policy_adaptation": {
                "backoff_multiplier_seconds": recommended_backoff,
                "dynamic_validation_strictness": security_level,
                "maximum_failure_attempts": max_attempts_limit,
                "optimization_active": True
            }
        }


if __name__ == "__main__":
    adaptation = AdaptationEngine("./database/test_adaptation.db")
    result = adaptation.analyze_and_adapt_system_policy()
    print(result)
    import shutil
    if os.path.exists("./database"):
        shutil.rmtree("./database", ignore_errors=True)
