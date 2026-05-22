"""
JARVIS-OS Verification Engine
Binds ExecutionValidator and RetryManager into a unified interface verifying filesystem runs and command operations.
"""
import time
import logging
from typing import Tuple, Dict, Any, List

from core.verification_engine.execution_validator import ExecutionValidator
from core.verification_engine.retry_manager import RetryManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VerificationEngine")


class VerificationEngine:
    """Supervises executing tasks, analyzing their exit logs, and initiating automated recovery loops."""

    def __init__(self, sandbox_root: str = "./sandbox"):
        self.validator = ExecutionValidator(sandbox_root)
        self.retry_mgr = RetryManager(default_attempts_limit=3, base_backoff_seconds=0.5)
        logger.info("Verification Engine fully calibrated. Health guard system online.")

    def verify_action_success(self, command_line: str, execution_result: str, success_indicator: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        """Audits command execution outcomes, looking at stdout logs and file updates."""
        # 1. Inspect logs text for exceptions
        log_report = self.validator.inspect_logs_for_errors(execution_result, "")
        
        # Determine overall wellness verdict
        overall_success = success_indicator and log_report["success"]
        err_msg = "" if overall_success else log_report["summary_verdict"]

        if not log_report["success"]:
            logger.warning(f"Anomalies caught in command execution: {log_report['summary_verdict']}")

        # 2. Extract targeted file pathways to verify state outcomes (e.g., if we were creating a file)
        tokens = command_line.split()
        if tokens:
            cmd_type = tokens[0].lower()
            if cmd_type == "create_file" and len(tokens) > 1:
                filepath = tokens[1]
                # Audit existence and syntax if python
                exists_ok, exist_msg = self.validator.validate_file_exist_and_not_empty(filepath)
                if not exists_ok:
                    overall_success = False
                    err_msg += f" | {exist_msg}"
                elif filepath.endswith(".py"):
                    syntax_ok, syntax_msg = self.validator.validate_python_syntax(filepath)
                    if not syntax_ok:
                        overall_success = False
                        err_msg += f" | {syntax_msg}"

        return overall_success, err_msg, log_report

    def manage_failure_retry(self, task_key: str, error_msg: str, detected_categories: List[str] = None) -> Tuple[bool, float, Dict[str, Any]]:
        """Maintains state attempt histories to track progress. Determines retry delay and correction strategies."""
        return self.retry_mgr.record_failure_and_check_retry(task_key, error_msg, detected_categories)


if __name__ == "__main__":
    verifier = VerificationEngine("./my_sandbox")
    
    # Test valid simulation file check
    import os
    os.makedirs("./my_sandbox", exist_ok=True)
    with open("./my_sandbox/test.py", "w") as f:
        f.write("print('Hello Verification World')")
        
    succeeded, summary, report = verifier.verify_action_success("create_file test.py", "Succesfully written files.", True)
    print(f"Verified Test.py success: {succeeded}, Logs: {summary}")
    
    # Test syntax invalid simulation file check
    with open("./my_sandbox/broken.py", "w") as f:
        f.write("def missing_colon()\n  pass")
    succeeded_b, summary_b, report_b = verifier.verify_action_success("create_file broken.py", "Written broken script.", True)
    print(f"Verified broken.py success: {succeeded_b}, Logs: {summary_b}")
    
    import shutil
    shutil.rmtree("./my_sandbox", ignore_errors=True)
