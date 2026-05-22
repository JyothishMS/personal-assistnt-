"""
JARVIS-OS Retry Pattern Learning Engine
Maintains records of repeated efforts to determine optimal retry profiles, preventing futile repetitive computation.
"""
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RetryPatternLearning")


class RetryPatternLearning:
    """Estimates the feasibility and wait-times for retrying operations based on historical repair loops."""

    def __init__(self):
        # Keeps internal statistics on retry limits
        # Maps error categories to historical success ratios on retry
        self.retry_feasibility_table = {
            "FILE_MISSING": 0.85,      # High rate of success if we trigger automatic file creation!
            "COMMAND_UNAVAILABLE": 0.05, # Futile to retry if binary doesn't exist
            "PRIVILEGE_RESTRICTION": 0.0, # Futile (cannot magically elevate sudo)
            "SYNTAX_FATAL": 0.1,         # Low success on standard retry without manual code modifications
            "PORT_CONFLICT": 0.70,       # Succeeds if we wait for previous process to release port
            "TIMEOUT_WARN": 0.60         # Succeeds if timeout threshold is expanded
        }

    def evaluate_retry_strategy(self, error_category: str, current_attempt_index: int) -> Dict[str, Any]:
        """Advises if retrying is pragmatic, and calculates the optimal retry delay in seconds."""
        success_chance = self.retry_feasibility_table.get(error_category, 0.40)

        should_retry = False
        delay_sec = 0.5
        msg = "Ready to proceed."

        if current_attempt_index >= 3:
            should_retry = False
            msg = "Exceeded limit. Aborting further iterations."
        elif success_chance == 0.0:
            should_retry = False
            msg = "Retry futile due to administrative or privilege restriction rules."
        elif success_chance < 0.2:
            should_retry = False
            msg = "Low success likelihood. Re-evaluation advised."
        else:
            should_retry = True
            # Calculate exponential backoff spaced by statistical reliability
            delay_sec = round((1.5 ** current_attempt_index) * (1.0 / success_chance), 2)
            msg = f"Pragmatic pattern recognized. Ready for attempt {current_attempt_index + 1}."

        logger.info(f"Retry Evaluation: Category={error_category}. Should retry={should_retry}. Delay={delay_sec}s. Note: {msg}")

        return {
            "error_category": error_category,
            "should_retry": should_retry,
            "recommended_delay_seconds": delay_sec,
            "verdict_reasoning": msg
        }


if __name__ == "__main__":
    rpl = RetryPatternLearning()
    print(rpl.evaluate_retry_strategy("FILE_MISSING", 1))
    print(rpl.evaluate_retry_strategy("PRIVILEGE_RESTRICTION", 1))
