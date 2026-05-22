"""
JARVIS-OS Terminal CLI Interface
Compiles clean ASCII headers, prompts for tasks, and routes system diagnostics outputs.
"""
import sys
import logging
from core.runtime.jarvis_runtime import JarvisBackgroundDaemon

logging.basicConfig(level=logging.ERROR)  # Suppress debug logs on primary stdout


class JARVIS_TerminalInterface:
    """ASCII Styled system dashboard providing user command lines inputs."""

    def __init__(self, daemon: JarvisBackgroundDaemon):
        self.daemon = daemon

    def render_ascii_header(self):
        """Standard human-literal aesthetic console branding."""
        header = """
    ===============================================================
       █████╗  █████╗ ██████╗ ██╗   ██╗██╗███████╗      ██████╗ ███████╗
      ██╔══██╗██╔══██╗██╔══██╗██║   ██║██║██╔════╝     ██╔═══██╗██╔════╝
      ███████║███████║██████╔╝██║   ██║██║███████╗     ██║   ██║███████╗
      ██╔══██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║     ██║   ██║╚════██║
      ██║  ██║██║  ██║██║  ██║ ╚████╔╝ ██║███████║     ╚██████╔╝███████║
      ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝      ╚═════╝ ╚══════╝
    ===============================================================
     Sovereign Offline AI Operating System Layer  |  Version 1.0-Beta
    ===============================================================
    Commands Examples:
      - "Create file roadmap.md containing 'Step 1: Code local core'"
      - "List files"
      - "Delete file roadmap.md"
      - "Organize downloads"
      
    Type 'exit' to terminate daemon thread. Type 'status' for host logs.
    """
        print(header)

    def start_terminal_shell(self):
        """Continuous input prompt looping system."""
        self.render_ascii_header()
        
        while True:
            try:
                user_line = input("\njarvis@os:~$ ").strip()
                if not user_line:
                    continue

                if user_line.lower() in ["exit", "quit", "shutdown"]:
                    print("Initiating clean decommission procedures...")
                    break

                if user_line.lower() in ["status", "sysinfo"]:
                    # Print live system properties
                    metrics = self.daemon.state_tracker.get_hardware_telemetry()
                    print("\n--- System Diagnostics ---")
                    for k, v in metrics.items():
                        print(f"  {k:<20}: {v}")
                    continue

                # Pass user text query to the sovereign runtime daemon
                print("Processing sovereign parsing...")
                report = self.daemon.process_terminal_statement(user_line)
                
                status_outcome = report.get("status")
                feedback = report.get("summary_feedback", "State processed successfully.")
                
                if status_outcome == "security_violation":
                    print(f"\a[SECURITY EXCEPTION] Request rejected: {feedback}")
                elif status_outcome == "failed":
                    print(f"[PROCESS FAIL] Execution aborted: {feedback}")
                else:
                    print(f"\n[JARVIS Outcome] Status: {status_outcome.upper()}")
                    print(f"Feedback: {feedback}")

                    # List files steps taken
                    steps = report.get("steps_taken", [])
                    if steps:
                        print("Execution Step Breakdown Logs:")
                        for idx, step in enumerate(steps):
                            print(f"  [{idx+1}] Intent: {step['action_intent']} -> Code: {step['status'].upper()}")
                            print(f"      Log: {step['log_message']}")
                            
            except (KeyboardInterrupt, EOFError):
                print("\nSession interrupted. Powering down safely.")
                break


if __name__ == "__main__":
    daemon_obj = JarvisBackgroundDaemon()
    daemon_obj.start_service()
    
    cli = JARVIS_TerminalInterface(daemon_obj)
    cli.start_terminal_shell()
    
    daemon_obj.stop_service()
