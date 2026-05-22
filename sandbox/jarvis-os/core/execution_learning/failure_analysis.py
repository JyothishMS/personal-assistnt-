"""
JARVIS-OS Failure Analysis Engine
Reviews failed output streams (stderr) to categorize errors and suggest automated repair tactics.
"""
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FailureAnalysis")


class FailureAnalysis:
    """Classifies runtime failures to recommend alternative execution strategies (e.g. self-healing)."""

    def __init__(self):
        # Maps common error strings to corrective categories
        self.signatures = {
            "no such file or directory": "FILE_MISSING",
            "command not found": "COMMAND_UNAVAILABLE",
            "permission denied": "PRIVILEGE_RESTRICTION",
            "syntax error": "SYNTAX_FATAL",
            "address already in use": "PORT_CONFLICT",
            "timeout": "TIMEOUT_WARN"
        }

    def analyze_failure(self, command: str, stderr: str) -> Dict[str, Any]:
        """Scans stderr to identify structural bugs and advises recovery actions."""
        if not stderr:
            return {"category": "UNKNOWN", "severity": "LOW", "remedy": "Re-run command with debugging context loggers enabled."}

        stderr_low = stderr.lower()
        matched_cat = "UNKNOWN"
        remedy = "Inspect command options and parameters layout."

        for sig, cat in self.signatures.items():
            if sig in stderr_low:
                matched_cat = cat
                break

        # Generate custom repair suggestions based on category
        if matched_cat == "FILE_MISSING":
            remedy = "Verify directories or pre-create target files using 'create_file' utility before execution."
        elif matched_cat == "COMMAND_UNAVAILABLE":
            remedy = "Command is missing in current sandbox root environment path. Check tools installed or use built-in python equivalent."
        elif matched_cat == "PRIVILEGE_RESTRICTION":
            remedy = "The sandbox denies administrative overrides on system configuration blocks. Request safe authorization."
        elif matched_cat == "SYNTAX_FATAL":
            remedy = "Analyze script characters for open bracket closures or quotation alignment."
        elif matched_cat == "PORT_CONFLICT":
            remedy = "Ensure previous instances are completely halted or configure alternate ports."
        elif matched_cat == "TIMEOUT_WARN":
            remedy = "Expand execution runtime buffer (wait threshold limit) or optimize slow thread processes."

        logger.info(f"Analyzed command failure: Category {matched_cat}. Proposed remedy: {remedy}")
        
        return {
            "failed_command": command,
            "category": matched_cat,
            "relevance_level": "CRITICAL" if matched_cat in ["PRIVILEGE_RESTRICTION", "SYNTAX_FATAL"] else "MODERATE",
            "remedy_proposal": remedy
        }


if __name__ == "__main__":
    fa = FailureAnalysis()
    res = fa.analyze_failure("cat important_config.yaml", "cat: important_config.yaml: No such file or directory")
    print(res)
