"""
JARVIS-OS Security Engine
Strict sandbox validation layer preventing escape sequences, checking execution trust scores, and blocking escalations.
"""
import os
import re
import shutil
import logging
from typing import Tuple, Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SecurityEngine")


class SecurityEngine:
    """Blocks risky terminal executions, calculates trust scores, avoids sandbox escapes, and manages rollback snapshots."""

    def __init__(self, sandbox_root: str = "./sandbox", block_regex: str = None):
        self.sandbox_root = os.path.abspath(sandbox_root)
        os.makedirs(self.sandbox_root, exist_ok=True)
        
        # Default regulatory blocker protecting file scopes and host processes
        default_regex = r"(rm\s+-rf|sudo\b|chmod\b|chown\b|mkfs\b|dd\b|\bkill\s+-9|\.\./\.\.|apt-get install|systemctl|reboot|shutdown|su\s+-|passwd)"
        self.blocked_pattern = re.compile(block_regex if block_regex else default_regex, re.IGNORECASE)
        self.whitelist_commands = {"create_file", "list_files", "read_file", "delete_file", "organize_folder"}
        
        # Active file snapshot records to allow clean recovery states
        self.safe_snapshots: Dict[str, Dict[str, bytes]] = {}
        logger.info("Sovereign Security Engine online. Safe boundaries and escalation locks active.")

    def audit_input_statement(self, user_text: str) -> Tuple[bool, str]:
        """Analyzes natural language requests for conversational bypass hacks or extreme instructions."""
        low_text = user_text.lower()
        threat_patterns = [
            "wipe hard drive", "delete system files", "format disk", 
            "disable security", "bypass validation", "escape sandbox"
        ]
        if any(trigger in low_text for trigger in threat_patterns):
            logger.warning(f"Extreme hazard intent identified and blocked: '{user_text}'")
            return False, "Prompt contains instructions flagged as systemically high-risk."
        return True, "Passed basic input assessment"

    def authorize_system_execution(self, system_command: str) -> Tuple[bool, str]:
        """Runs multi-layered checks on terminal and automated tools prior to execution."""
        cmd_clean = system_command.strip()

        # 1. Block command execution using our regulatory pattern regex
        if self.blocked_pattern.search(cmd_clean):
            matched = self.blocked_pattern.search(cmd_clean).group(0)
            logger.critical(f"UNAUTHORIZED ELEVATION ATTEMPT REJECTED: Footprint detected: '{matched}'")
            return False, f"SECURITY ALARM: Blocked execution containing prohibited pattern '{matched}'"

        # 2. Block system path traversal
        dangerous_paths = ["/etc", "/var", "/usr", "/bin", "/boot", "~/", ".."]
        for p_token in dangerous_paths:
            if p_token in cmd_clean:
                if "../" in cmd_clean or p_token.startswith("/etc") or p_token.startswith("/boot"):
                    logger.critical(f"DIRECTORY TRAVERSAL SECTOR DETECTED: Traversal token '{p_token}'")
                    return False, f"SECURITY ALARM: Escape traversal token '{p_token}' is banned."

        logger.info(f"Command verified as safe for isolated sandbox loop: '{cmd_clean}'")
        return True, "Execution authorized"

    def calculate_execution_trust_score(self, command_line: str) -> Tuple[int, str]:
        """Computes a numeric rating from 0 (Danger) to 100 (Safe) for incoming command scripts."""
        score = 100
        reasons = []

        # Reduce score for write or destructive actions
        low_cmd = command_line.lower()
        if "rm " in low_cmd or "delete" in low_cmd:
            score -= 30
            reasons.append("Destructive write action detected.")
        if "execute" in low_cmd or "sh " in low_cmd or "bash" in low_cmd:
            score -= 40
            reasons.append("Interactive shell invocation is highly sensitive.")
        if "curl" in low_cmd or "wget" in low_cmd:
            score -= 25
            reasons.append("Downlinks external resources packages.")
        if "python" in low_cmd or "pip" in low_cmd:
            score -= 20
            reasons.append("Python binary runtime trigger.")

        # Re-elevate score if it matches pure whitelist
        if any(wh in low_cmd for wh in self.whitelist_commands):
            score = min(score + 15, 100)

        verdict = "Trusted" if score >= 70 else ("Suspicious" if score >= 40 else "High Threat")
        logger.info(f"Trust Evaluator rating calculated: Score: {score}/100. Verdict: {verdict}. Reasons: {reasons}")
        return score, f"Verdict: {verdict}. Factors: {reasons}"

    def verify_sandbox_containment(self, file_path_parameter: str) -> bool:
        """Resolves absolute canonical target paths mathematically to ensure they sit inside the sandbox bounds."""
        try:
            # Resolve symbolic links or parent relative paths
            absolute_target = os.path.realpath(os.path.join(self.sandbox_root, file_path_parameter))
            # Test if prefix fits perfectly inside sandbox folders
            is_contained = absolute_target.startswith(self.sandbox_root)
            if not is_contained:
                logger.critical(f"PATH CONTAINMENT ESCAPE DETECTED: Canonical target path '{absolute_target}' lies outside sandbox '{self.sandbox_root}'")
            return is_contained
        except Exception as e:
            logger.error(f"Failed sandbox canonical verification: {e}")
            return False

    def create_rollback_snapshot(self, snapshot_id: str) -> bool:
        """Captures state backup of all file bytes in sandbox directory as a safe rollback point."""
        try:
            snap: Dict[str, bytes] = {}
            if os.path.exists(self.sandbox_root):
                for root, dirs, files in os.walk(self.sandbox_root):
                    for f in files:
                        full_p = os.path.join(root, f)
                        rel_p = os.path.relpath(full_p, self.sandbox_root)
                        with open(full_p, "rb") as reader:
                            snap[rel_p] = reader.read()
            self.safe_snapshots[snapshot_id] = snap
            logger.info(f"Registered safe rollback snapshot ID: '{snapshot_id}'. Total cached files count: {len(snap)}")
            return True
        except Exception as e:
            logger.error(f"Snapshot registration aborted: {e}")
            return False

    def restore_rollback_snapshot(self, snapshot_id: str) -> bool:
        """Restores file system state back to specified backup, wiping any newly generated untrusted code files."""
        if snapshot_id not in self.safe_snapshots:
            logger.error(f"Unable to restore: Snapshot ID '{snapshot_id}' does not exist inside security register.")
            return False

        try:
            snap = self.safe_snapshots[snapshot_id]
            # 1. Clean current sandbox first
            if os.path.exists(self.sandbox_root):
                for item in os.listdir(self.sandbox_root):
                    item_path = os.path.join(self.sandbox_root, item)
                    if os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                    else:
                        os.remove(item_path)

            # 2. Re-write snapshot file buffers
            for rel_path, contents in snap.items():
                dest_p = os.path.join(self.sandbox_root, rel_path)
                os.makedirs(os.path.dirname(dest_p), exist_ok=True)
                with open(dest_p, "wb") as writer:
                    writer.write(contents)

            logger.warning(f"RESTORE COMPLETED: System successfully rolled back sandbox files according to Snapshot ID: '{snapshot_id}'")
            return True
        except Exception as e:
            logger.error(f"Snapshot restore execution failed: {e}")
            return False


if __name__ == "__main__":
    shield = SecurityEngine(sandbox_root="./test_safety_sandbox")
    
    # Test path canonical resolution escape blocks
    print("Contained check (safe):", shield.verify_sandbox_containment("code.py"))
    print("Contained check (escape):", shield.verify_sandbox_containment("../../etc/passwd"))
    
    # Test trust score calculator
    print("Trust Score 'list_files':", shield.calculate_execution_trust_score("list_files"))
    print("Trust Score 'bash script':", shield.calculate_execution_trust_score("bash custom_hack.sh"))
    
    # Test sandbox backup
    with open("./test_safety_sandbox/important_doc.txt", "w") as fd:
        fd.write("Sovereign operational files.")
    
    shield.create_rollback_snapshot("checkpoint_A")
    
    # destructive changes
    with open("./test_safety_sandbox/important_doc.txt", "w") as fd:
        fd.write("Hacked file damage contents.")
    with open("./test_safety_sandbox/untrusted_extra.py", "w") as fd:
        fd.write("extra malicious file")
        
    shield.restore_rollback_snapshot("checkpoint_A")
    print("Doc contents post rollback:", open("./test_safety_sandbox/important_doc.txt", "r").read())
    print("Untrusted file exists:", os.path.exists("./test_safety_sandbox/untrusted_extra.py"))
    
    shutil.rmtree("./test_safety_sandbox", ignore_errors=True)
