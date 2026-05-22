"""
JARVIS-OS Execution Validator
Programmatically inspects files, exit states, syntax correctness, and stdout logs to evaluate task success.
"""
import os
import re
import ast
import logging
from typing import Tuple, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ExecutionValidator")


class ExecutionValidator:
    """Methods to inspect system state and output strings to guarantee execution integrity."""

    def __init__(self, sandbox_root: str = "./sandbox"):
        self.sandbox_root = os.path.abspath(sandbox_root)

    def validate_file_exist_and_not_empty(self, filepath: str) -> Tuple[bool, str]:
        """Asserts that a file exists, is locked under the sandbox, and has non-trivial bytes."""
        try:
            full_path = self._get_safe_path(filepath)
            if not os.path.exists(full_path):
                return False, f"Verification failed: File '{filepath}' does not exist inside sandbox."
            
            if not os.path.isfile(full_path):
                return False, f"Verification failed: Path '{filepath}' is a directory, not a generic file."

            size = os.path.getsize(full_path)
            if size == 0:
                return False, f"Verification failed: File '{filepath}' exists but is empty (0 bytes)."

            return True, f"File '{filepath}' verified. Size: {size} bytes."
        except Exception as e:
            return False, f"Verification error accessing '{filepath}': {str(e)}"

    def validate_python_syntax(self, filepath: str) -> Tuple[bool, str]:
        """Reads a written Python module inside the sandbox and parses its AST to ensure zero syntax blocks."""
        try:
            full_path = self._get_safe_path(filepath)
            if not os.path.exists(full_path):
                return False, f"File '{filepath}' was not found for syntax verification."

            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Compile AST (Abstract Syntax Tree) to check syntax correctness without execution
            ast.parse(content)
            return True, f"Python file '{filepath}' syntax parsed successfully. Ready for deployment."
        except SyntaxError as se:
            logger.warning(f"Syntax error caught in '{filepath}': {se.msg} on line {se.lineno}")
            return False, f"Syntax Error in Python code on line {se.lineno}, column {se.offset}: {se.msg}"
        except Exception as e:
            return False, f"Unable to verify file structure due to general error: {str(e)}"

    def inspect_logs_for_errors(self, stdout: str, stderr: str) -> Dict[str, Any]:
        """Scans process run streams and logs for exception markers, syntax errors, or dependency failure footprints."""
        combined = (stdout + "\n" + stderr).lower()
        error_signals = {
            "syntax_error": [r"syntaxerror", r"unexpected token", r"unindent does not match"],
            "module_not_found": [r"modulenotfounderror", r"no module named", r"import error", r"cannot find module"],
            "permission_error": [r"permissionerror", r"permission denied", r"unauthorized access", r"access denied"],
            "port_blocked": [r"port \d+ is already in use", r"eaddrinuse", r"address already in use"],
            "connection_refused": [r"connection refused", r"host unreachable", r"timeout of \d+ms exceeded"],
            "file_not_found": [r"filenotfounderror", r"no such file or directory"]
        }

        found_errors = []
        for category, patterns in error_signals.items():
            for pat in patterns:
                if re.search(pat, combined):
                    found_errors.append(category)
                    break

        is_healthy = len(found_errors) == 0
        return {
            "success": is_healthy,
            "detected_error_categories": found_errors,
            "has_error_substring": not is_healthy,
            "summary_verdict": "Healthy telemetry output" if is_healthy else f"Unhealthy output signature. High correlation to: {', '.join(found_errors)}"
        }

    def _get_safe_path(self, relative_path: str) -> str:
        """Translates path parameters safely inside the designated sandbox boundaries."""
        resolved = os.path.abspath(os.path.join(self.sandbox_root, relative_path))
        if not resolved.startswith(self.sandbox_root):
            raise PermissionError("Path Traversal Escape Action Inhibited by Command Sandbox Environment.")
        return resolved


if __name__ == "__main__":
    validator = ExecutionValidator("./test_sandbox")
    os.makedirs("./test_sandbox", exist_ok=True)
    with open("./test_sandbox/syntax_fail.py", "w") as f:
        f.write("def broken_syntax(\n")
    
    print(validator.validate_python_syntax("syntax_fail.py"))
    print(validator.inspect_logs_for_errors("Traceback: ModuleNotFoundError: No module named 'psutil'", ""))
    import shutil
    shutil.rmtree("./test_sandbox", ignore_errors=True)
