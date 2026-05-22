"""
JARVIS-OS Intelligent Retry Manager
Tracks task attempt histories, manages linear or exponential backoffs, and counsels on alternate command options.
"""
import time
import logging
from typing import Dict, Any, Tuple, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RetryManager")


class RetryManager:
    """Manages active task backoff structures, evaluates attempts budgets, and suggests healing solutions."""

    def __init__(self, default_attempts_limit: int = 3, base_backoff_seconds: float = 0.5):
        self.max_limits = default_attempts_limit
        self.base_backoff = base_backoff_seconds
        # Tracks states of specific task titles
        self.attempts_history: Dict[str, Dict[str, Any]] = {}

    def start_transaction(self, key: str, custom_limit: int = None) -> Dict[str, Any]:
        """Registers or resets a tracked command transaction key."""
        self.attempts_history[key] = {
            "attempts": 0,
            "max": custom_limit or self.max_limits,
            "failures": [],
            "start_time": time.time()
        }
        return self.attempts_history[key]

    def record_failure_and_check_retry(self, key: str, err_message: str, error_categories: List[str] = None) -> Tuple[bool, float, Dict[str, Any]]:
        """Increments attempt index, registers error footprint, and calculates required cooling interval if eligible."""
        if key not in self.attempts_history:
            self.start_transaction(key)

        record = self.attempts_history[key]
        record["attempts"] += 1
        record["failures"].append({"attempt": record["attempts"], "error": err_message, "timestamp": time.time()})

        current_cnt = record["attempts"]
        limit = record["max"]

        if current_cnt >= limit:
            logger.warning(f"Transaction '{key}' failed permanently across maximum budget of {limit} attempts.")
            return False, 0.0, self.get_remedy_strategy(err_message, error_categories or [])

        # Calculate dynamic backoff spacing (exponential factor: base * 2 ^ (attempt - 1))
        delay = self.base_backoff * (2 ** (current_cnt - 1))
        logger.info(f"Task retry scheduled for '{key}'. Wait interval: {delay:.2f}s [Attempt {current_cnt + 1}/{limit}]")
        
        remedy = self.get_remedy_strategy(err_message, error_categories or [])
        return True, delay, remedy

    def get_remedy_strategy(self, err_message: str, error_categories: List[str]) -> Dict[str, Any]:
        """Examines failure logs and recommends targeted automatic recovery scripts or changes."""
        remedy = {
            "action_proposed": "RETRY_ORIGINAL",
            "suggested_command_override": None,
            "requires_human_approval": False,
            "explanation": "No custom signature matched. Retrying standard baseline parameters."
        }

        # Match specific classifications
        msg_low = err_message.lower()

        if "modulenotfound" in msg_low or "import error" in msg_low or "module_not_found" in error_categories:
            remedy["action_proposed"] = "INSTALL_DEPENDENCY"
            # Auto extract missing pack name if possible
            import re
            match = re.search(r"no module named ['\"]([\w_-]+)['\"]", msg_low)
            pkg = match.group(1) if match else "pip-installable-target"
            remedy["suggested_command_override"] = f"install_package {pkg}"
            remedy["explanation"] = f"Detected missing python library package: '{pkg}'. Attempting dynamic resolution."
            remedy["requires_human_approval"] = False

        elif "permission" in msg_low or "access denied" in msg_low or "permission_error" in error_categories:
            remedy["action_proposed"] = "REQUEST_ESCALATION"
            remedy["explanation"] = "Security restrictions blocked local folder writing. Requires interactive approval."
            remedy["requires_human_approval"] = True

        elif "syntaxerror" in msg_low or "syntax_error" in error_categories:
            remedy["action_proposed"] = "REGENERATE_CODE"
            remedy["explanation"] = "The generated script contains layout or spelling logic errors. Re-triggering refactor instruction."
            remedy["requires_human_approval"] = False

        elif "address already in use" in msg_low or "eaddrinuse" in msg_low or "port_blocked" in error_categories:
            remedy["action_proposed"] = "FREE_PORT"
            remedy["explanation"] = "Target server address port is currently claimed by another process. Suggesting port shift."
            remedy["suggested_command_override"] = "kill_port_holders"
            remedy["requires_human_approval"] = True

        return remedy


if __name__ == "__main__":
    mgr = RetryManager(default_attempts_limit=3, base_backoff_seconds=1.0)
    mgr.start_transaction("build_app")
    
    # Attempt 1
    can_retry, sleep_time, sol = mgr.record_failure_and_check_retry("build_app", "ModuleNotFoundError: No module named 'matplotlib'")
    print(f"Can Retry: {can_retry}, Delay: {sleep_time}, Remedy Action: {sol['action_proposed']}, Cmd: {sol['suggested_command_override']}")

    # Attempt 2
    can_retry, sleep_time, sol = mgr.record_failure_and_check_retry("build_app", "SyntaxError: unexpected EOF while parsing")
    print(f"Can Retry: {can_retry}, Delay: {sleep_time}, Remedy Action: {sol['action_proposed']}")

    # Attempt 3
    can_retry, sleep_time, sol = mgr.record_failure_and_check_retry("build_app", "Another unhandled runtime crash")
    print(f"Can Retry: {can_retry}")
