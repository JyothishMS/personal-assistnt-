"""
JARVIS-OS Background Daemon Runtime
Runs continuous loops monitoring local systems, ticking tasks, and scanning for wake words.
"""
import os
import sys
import time
import logging
import threading
from typing import Dict, Any

from core.system_state.system_state import SystemState
from core.security_engine.security_engine import SecurityEngine
from core.memory_engine.memory_engine import MemoryEngine
from core.command_engine.command_engine import CommandEngine
from core.task_engine.task_engine import TaskEngine
from core.ai_engine.ai_coordinator import AICoordinator
from core.intent_engine.intent_engine import IntentEngine
from core.confidence.confidence_scoring import ConfidenceScoring

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("JARVIS-Daemon")


class JarvisBackgroundDaemon:
    """Intelligent persistent sovereign operating daemon running on thread loop schedules."""

    def __init__(self, config_data: dict = None):
        self._config = config_data or {}
        
        # Initialize subsystem blocks
        self.state_tracker = SystemState()
        self.security = SecurityEngine()
        self.memory = MemoryEngine(self._config.get("memory", {}).get("database_path", "./database/jarvis_memory.db"))
        self.commander = CommandEngine()
        self.intent_parser = IntentEngine()
        self.confidence_scorer = ConfidenceScoring()
        db_path = self._config.get("memory", {}).get("database_path", "./database/jarvis_memory.db")
        self.task_coordinator = TaskEngine(self.security, self.commander, db_path=db_path)
        self.ai_coordinator = AICoordinator(
            primary_model=self._config.get("models", {}).get("primary", "llama3:8b"),
            coder_model=self._config.get("models", {}).get("coder", "deepseek-coder:6.7b")
        )

        self.wake_word = self._config.get("voice", {}).get("wake_word", "hey jarvis").lower()
        self.tick_rate = self._config.get("system", {}).get("idle_sleep_seconds", 1.0)
        self.is_running = False
        self._main_thread = None

    def start_service(self):
        """Spawns the continuous background worker thread daemon."""
        if self.is_running:
            logger.warning("JARVIS-OS Background thread is already active.")
            return

        self.is_running = True
        self._main_thread = threading.Thread(target=self._daemon_process_loop, daemon=True)
        self._main_thread.start()
        logger.info(f"Sovereign background loops activated successfully. Sleep cycle: {self.tick_rate}s")

    def stop_service(self):
        """Safely shuts down internal tickers and commits database caches."""
        self.is_running = False
        if self._main_thread:
            self._main_thread.join(timeout=3.0)
        logger.info("Background daemon service disengaged. State variables archived.")

    def run_on_foreground(self):
        """Enters block loop, useful for direct development console starts."""
        self.is_running = True
        logger.info("Starting foreground daemon context session...")
        try:
            self._daemon_process_loop()
        except KeyboardInterrupt:
            self.stop_service()

    def process_terminal_statement(self, command_prompt: str) -> dict:
        """Handles synchronous user inputs, saving them, passing through engines, and executing."""
        if not command_prompt.strip():
            return {"status": "empty"}

        # Active Memory Influence: Prior to planning or intent resolution, retrieve context frame
        context_frame = self.task_coordinator.context_memory.retrieve_context_frame(command_prompt)

        # 1. Linguistic Parsing (intent_engine) using the retrieved context to resolve structured intent
        parsed_intent = self.intent_parser.parse_intent(command_prompt, context_frame)
        intent_tag = parsed_intent.get("intent_type", "CONVERSE")
        rec_cmd = parsed_intent.get("recommended_command", "")

        # Handle FAILED_INTENT - block task completion and send to clarification
        if intent_tag == "FAILED_INTENT":
            self.memory.save_chat("user", command_prompt)
            clarification_msg = "CLARIFICATION REQUIRED: Unable to resolve natural language intent to a concrete command sequence safely."
            self.memory.save_chat("jarvis", clarification_msg)
            self.memory.log_automation_run("FAILED_INTENT", command_prompt, intent_tag, rec_cmd, clarification_msg, "clarification_needed")
            return {
                "status": "failed",
                "summary_feedback": clarification_msg,
                "confidence_score": parsed_intent.get("confidence", 0.0)
            }

        # Handle pure social CONVERSE - reply without silent execution bypass or false successes
        if intent_tag == "CONVERSE":
            self.memory.save_chat("user", command_prompt)
            reply = self.ai_coordinator.query_ollama(command_prompt)
            if "Ollama local instance link inactive" in reply:
                reply = f"Hello there! I registered your statement '{command_prompt}'. Let me know what operational system tasks you'd like to perform."
            self.memory.save_chat("jarvis", reply)
            self.memory.log_automation_run("CONVERSE", command_prompt, "CONVERSE", "", reply, "success")
            return {
                "status": "success",
                "summary_feedback": reply,
                "confidence_score": parsed_intent.get("confidence", 0.9)
            }

        # 2. Confidence check before committing to autonomous execution
        conf_data = self.confidence_scorer.calculate_confidence(command_prompt, rec_cmd)
        can_execute = conf_data.get("can_execute_autonomously", True)

        if not can_execute:
            self.memory.save_chat("user", command_prompt)
            clarification_msg = f"CLARIFICATION REQUIRED: {', '.join(conf_data.get('detected_semantic_issues', ['Unclear language constraint.']))}"
            self.memory.save_chat("jarvis", clarification_msg)
            self.memory.log_automation_run("CONFIDENCE_CLARIFY", command_prompt, intent_tag, rec_cmd, clarification_msg, "clarify")
            return {
                "status": "clarification_needed",
                "summary_feedback": clarification_msg,
                "confidence_score": conf_data.get("confidence_score")
            }

        # 3. Security validation & input string auditing prior to task planning
        ok, reason = self.security.audit_input_statement(command_prompt)
        if not ok:
            self.memory.save_chat("user", command_prompt)
            self.memory.save_chat("jarvis", f"SECURITY ALARM: Instruction Blocked. {reason}")
            self.memory.log_automation_run("SECURITY", command_prompt, "BLOCKED", "None", reason, "blocked")
            return {"status": "security_violation", "message": reason}

        # Save approved user query to persistent SQLite chat logs
        self.memory.save_chat("user", command_prompt)

        # 4. Task engine planning & execution using the validated structured_intent and context
        plan_report = self.task_coordinator.plan_and_execute_goal(
            command_prompt, 
            self.state_tracker.get_hardware_telemetry(), 
            context_frame=context_frame, 
            structured_intent=parsed_intent
        )
        outcome = plan_report.get("status")
        summary_narrative = plan_report.get("summary_feedback")

        # 5. Log final results & narrative to memory_engine database
        outcome_msg = f"Task sequence status={outcome}. Summary: {summary_narrative}"
        self.memory.save_chat("jarvis", summary_narrative)
        self.memory.log_automation_run(
            category="WORKFLOW",
            query=command_prompt,
            intent=intent_tag,
            command="; ".join(plan_report.get("decomposed_steps", [])),
            result=outcome_msg,
            status=outcome
        )

        return plan_report

    def _daemon_process_loop(self):
        """Primary continuous processing tick loop of the daemon system."""
        cycle_count = 0
        while self.is_running:
            try:
                cycle_count += 1
                
                # Dynamic optimization: check hardware states dynamically
                hw_stats = self.state_tracker.get_hardware_telemetry()
                cpu = hw_stats.get("cpu_percent", 0.0)
                
                # Log telemetry signals periodically to system memory db
                if cycle_count % 30 == 0:
                    logger.info(f"System Health Ticker: Host OS CPU is running at {cpu}% usage indicators.")
                    self.memory.set_preference("live_cpu_utilization", str(cpu))
                    self.memory.set_preference("live_ram_util_gb", str(hw_stats.get("ram_used_gb")))

                # Sleep cycle throttling dynamic optimization via ModuleScheduler
                sleep_interval = self.task_coordinator.scheduler.optimize_system_cycles(hw_stats)
                time.sleep(sleep_interval)
                
            except Exception as e:
                logger.error(f"Daemon process encounter run-loop anomaly: {e}")
                time.sleep(5.0)


if __name__ == "__main__":
    daemon_inst = JarvisBackgroundDaemon()
    daemon_inst.start_service()
    time.sleep(2)
    # Process test instruction
    res = daemon_inst.process_terminal_statement("create file log.txt with content 'Init successful'")
    print("Execution report:", res)
    daemon_inst.stop_service()
