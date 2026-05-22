"""
JARVIS-OS Execution Learning Strategy Optimizer
Orchestrates failure logs and retry learning weights to suggest operational alternatives.
"""
import logging
from typing import Dict, Any

from core.execution_learning.execution_history import ExecutionHistory
from core.execution_learning.failure_analysis import FailureAnalysis
from core.execution_learning.retry_pattern_learning import RetryPatternLearning

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("StrategyOptimizer")


class StrategyOptimizer:
    """Consolidates execution diagnostics and dynamically builds active recovery strategies."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db"):
        self.history = ExecutionHistory(db_path)
        self.analyst = FailureAnalysis()
        self.pattern_learner = RetryPatternLearning()

    def process_execution_outcome(self, command: str, success: bool, stderr: str, latency_ms: int, current_retry_index: int = 0) -> Dict[str, Any]:
        """Logs runtime outcome, parses failures, and outputs optimal strategy instructions."""
        status_term = "success" if success else "failure"
        
        # 1. Archive to SQLite history memory
        self.history.log_execution(command, status_term, stderr, latency_ms, current_retry_index)

        if success:
            logger.info(f"Execution Optimization: Command '{command}' completed normally.")
            return {
                "command_resolved": True,
                "should_retry": False,
                "strategy": "PROCEED",
                "message": "Step executed successfully."
            }

        # 2. Analyze failure category
        analysis = self.analyst.analyze_failure(command, stderr)
        error_category = analysis.get("category", "UNKNOWN")

        # 3. Determine if we should attempt retry or trigger alternative strategies
        retry_eval = self.pattern_learner.evaluate_retry_strategy(error_category, current_retry_index)

        strategy_route = "ABORT"
        fallback_plan = None

        if retry_eval.get("should_retry", False):
            strategy_route = "RETRY_WITH_BACKOFF"
        else:
            # Plan fallbacks based on diagnostics
            if error_category == "FILE_MISSING":
                strategy_route = "SELF_HEAL_CREATE_FILE"
                fallback_plan = "create_file"
            elif error_category == "COMMAND_UNAVAILABLE":
                strategy_route = "FALLBACK_BUILTIN"
                fallback_plan = "python_mimic"

        logger.info(f"Generated resolution pathway: Strategy={strategy_route}, Fallback={fallback_plan}")

        return {
            "command_resolved": False,
            "error_analysis": analysis,
            "should_retry": retry_eval.get("should_retry", False),
            "retry_delay_seconds": retry_eval.get("recommended_delay_seconds", 0.0),
            "strategy": strategy_route,
            "fallback_utility": fallback_plan,
            "message": retry_eval.get("verdict_reasoning", "Process aborted.")
        }


if __name__ == "__main__":
    opt = StrategyOptimizer("./database/test_opt.db")
    result = opt.process_execution_outcome("cat missing.txt", False, "cat: missing.txt: No such file or directory", 40, 1)
    print(result)
    import shutil
    shutil.rmtree("./database", ignore_errors=True)
