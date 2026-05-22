"""
JARVIS-OS Advanced Task Engine - Persistent Cognitive Execution Loop
Processes multi-step tasks through the autonomous sequence:
Goal -> Plan -> Validate -> Execute -> Verify -> Retry if failed -> Save memory -> Report completion.
Supports contextual memory restoration, thermal module scheduling, and dynamic checkpoint rollbacks.
"""
import re
import time
import os
import uuid
import logging
from typing import List, Dict, Any, Tuple

from core.intent_engine.intent_engine import IntentEngine
from core.security_engine.security_engine import SecurityEngine
from core.command_engine.command_engine import CommandEngine

# Cognitive, Verification, Memory, Scheduling, and State managers integration
from core.cognition_engine.cognition_engine import CognitionEngine
from core.verification_engine.verification_engine import VerificationEngine
from core.memory_engine.context_retriever import ContextRetriever
from core.runtime.module_scheduler import ModuleScheduler
from core.task_state_manager import TaskStateManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TaskEngine")


class TaskEngine:
    """The central neurological control pipeline executing JARVIS-OS cognitive loops."""

    def __init__(self, security_shield: SecurityEngine, cmd_layer: CommandEngine, db_path: str = "./database/jarvis_memory.db", sandbox_path: str = "./sandbox"):
        self.intent_parser = IntentEngine()
        self.security = security_shield
        self.commander = cmd_layer
        self.sandbox_path = sandbox_path

        # Initialize core autonomous layers
        self.cognition = CognitionEngine(checkpoints_dir="./database/checkpoints")
        self.verification = VerificationEngine(sandbox_root=sandbox_path)
        self.context_memory = ContextRetriever(db_path=db_path)
        self.scheduler = ModuleScheduler()
        self.state_tracker = TaskStateManager(db_path=db_path)

        logger.info("Cognitive Task Engine fully integrated. Autonomous execution loop operational.")

    def plan_and_execute_goal(self, original_prompt: str, current_system_metrics: Dict[str, Any] = None, context_frame: Dict[str, Any] = None, structured_intent: Dict[str, Any] = None) -> Dict[str, Any]:
        """Main orchestrator for the persistent Goal -> Plan -> Validate -> Execute -> Verify -> Retry -> Save Memory loop."""
        metrics = current_system_metrics or {"cpu_percent": 15.0, "ram_used_gb": 4.0, "battery_percent": 100, "battery_plugged": True}
        
        # Idle/active scheduling cycle throttling
        self.scheduler.request_module_activation("reasoning_llm")

        # -------------------------------------------------------------
        # STEP 1: CONTEXT RETRIEVAL (Active Memory input)
        # -------------------------------------------------------------
        if not context_frame:
            logger.info(f"Initiating context memory retrieval for target: '{original_prompt}'")
            context_frame = self.context_memory.retrieve_context_frame(original_prompt)
        
        # Enrich the query prompt internally if contextual matches exist
        enriched_prompt = original_prompt
        suggestions = context_frame.get("suggested_checkpoint_resumption", {})
        if suggestions:
            logger.info(f"Context Match Found: Uncompleted workflow '{suggestions['pipeline_id']}' related to original intent.")
            # Auto-resume warning or enrichment can go here in text
            enriched_prompt += f" (Contextually resuming past project matching: '{suggestions['original_goal']}')"

        # -------------------------------------------------------------
        # STEP 2: PLANNING & DECOMPOSITION & PRIORITIZATION
        # -------------------------------------------------------------
        if structured_intent and "steps" in structured_intent and structured_intent["steps"]:
            logger.info("Using pre-decomposed structured steps from unified intent decision framework.")
            pipeline_id = f"pip-{uuid.uuid4().hex[:8]}"
            steps = []
            for idx, s in enumerate(structured_intent["steps"]):
                action_guessed = s.get("inferred_action", "ACTION")
                
                # Check for rollback action
                rollback_action = "none"
                if action_guessed == "FILE_CREATE" or action_guessed == "FILE_OP":
                    filename = s.get("parameters", {}).get("filename", "")
                    if filename:
                        rollback_action = f"delete_file {filename}"
                
                steps.append({
                    "id": s.get("id", f"step_{idx+1}"),
                    "order": idx + 1,
                    "statement": s.get("statement", s.get("step_query", "")),
                    "inferred_action": action_guessed,
                    "dependencies": [f"step_{idx}"] if idx > 0 else [],
                    "status": "pending",
                    "checks_count": 0,
                    "rollback_rollback_action": rollback_action,
                    "recommended_command": s.get("recommended_command", ""),
                    "parameters": s.get("parameters", {})
                })
            pipeline = self.cognition.workflow_mgr.register_pipeline(pipeline_id, original_prompt, steps)
        else:
            logger.info("Decomposing goal into strategic task schedules via Cognition Planner...")
            pipeline_id, pipeline = self.cognition.construct_unifying_workflow(enriched_prompt, metrics)
            steps = pipeline.get("steps", [])

        execution_report = {
            "pipeline_id": pipeline_id,
            "prompt": original_prompt,
            "decomposed_steps": [s["statement"] for s in steps],
            "steps_taken": [],
            "status": "success",
            "summary_feedback": ""
        }

        # Initialize high-level Task State inside SQLite Progress Tracker
        self.state_tracker.upsert_task_state(pipeline_id, original_prompt, "active", "step_1")

        # Create localized recovery checkpoint baseline snapshot
        self.security.create_rollback_snapshot(f"{pipeline_id}_baseline")

        # -------------------------------------------------------------
        # SEQUENCE EXECUTION LOOP
        # -------------------------------------------------------------
        for step_idx, step in enumerate(steps):
            step_uuid = step["id"]
            step_statement = step["statement"]
            inferred_action = step.get("inferred_action", "CONVERSE")

            logger.info(f"Persistent loop executing step {step_idx + 1}/{len(steps)}: '{step_statement}'")
            self.state_tracker.upsert_task_state(pipeline_id, original_prompt, "active", step_uuid)
            self.cognition.update_task_state_and_snapshot(pipeline_id, step_uuid, "executing", "Began step run.")

            # Lazy load dynamic module drivers depending on active step category
            if inferred_action in ["FILE_CREATE", "FILE_OP"]:
                self.scheduler.request_module_activation("coding_assistant")
            elif inferred_action in ["LIST_FILES", "ORGANIZE_FOLDER", "AUTOMATION"]:
                self.scheduler.request_module_activation("automation_exec")

            # Parse semantic details to extract commands and recommended commands
            cmd = step.get("recommended_command", "")
            params = step.get("parameters", {})
            
            if not cmd:
                parsed_frame = self.intent_parser.parse_intent(step_statement, context_frame)
                cmd = parsed_frame.get("recommended_command", "")
                params = parsed_frame.get("parameters", {})
                inferred_action = parsed_frame.get("intent_type", inferred_action)

            # Conversational bypass check - only skip if pure social chat with no binary commands
            if inferred_action == "CONVERSE" and not cmd:
                step_log = "Purely conversational step. Skipped sandbox execution layer."
                self._record_step_progress(execution_report, pipeline_id, step_uuid, step_statement, "CONVERSE", "N/A", "success", step_log)
                continue

            # Fail loudly if intent/command is invalid or unresolved
            if inferred_action == "FAILED_INTENT" or not cmd:
                failure_log = f"CRITICAL: Refusing execution because intent is invalid or command mapping is missing for step: '{step_statement}'"
                logger.error(failure_log)
                self._record_step_progress(execution_report, pipeline_id, step_uuid, step_statement, inferred_action, cmd or "N/A", "failed", failure_log)
                self.state_tracker.upsert_task_state(pipeline_id, original_prompt, "failed", step_uuid)
                execution_report["status"] = "failed"
                execution_report["summary_feedback"] = f"Plan halted due to unresolved structured intent for step: '{step_statement}'."
                return execution_report

            # -------------------------------------------------------------
            # STEP 3: SECURITY VALIDATION & TRUST SCORING
            # -------------------------------------------------------------
            trust_score, trust_msg = self.security.calculate_execution_trust_score(cmd)
            safe_auth, auth_reason = self.security.authorize_system_execution(cmd)

            if not safe_auth or trust_score < 30:
                failure_log = f"CRITICAL: Step rejected by Security Shield. Trust score: {trust_score}. Reason: {auth_reason} | {trust_msg}"
                logger.error(failure_log)
                
                # Update pipeline snapshots to fail
                self._record_step_progress(execution_report, pipeline_id, step_uuid, step_statement, inferred_action, cmd, "blocked", failure_log)
                execution_report["status"] = "security_blocked"
                execution_report["summary_feedback"] = f"Goal aborted at step {step_idx + 1} due to security constraints."
                
                # Commit high-level fail
                self.state_tracker.upsert_task_state(pipeline_id, original_prompt, "failed", step_uuid)
                return execution_report

            # -------------------------------------------------------------
            # STEP 4: EXECUTION & INTELLIGENT RETRIES (VERIFICATION LOOP)
            # -------------------------------------------------------------
            step_success = False
            step_output = ""
            feedback_analysis = ""
            
            # Initiate dedicated backoff retry transaction track for this block
            self.verification.retry_mgr.start_transaction(step_uuid, custom_limit=3)

            while True:
                logger.info(f"Executing target action payload: '{cmd}' inside sandbox.")
                success_exec, exec_stdout = self.commander.execute_action(cmd, params)
                
                # Let's cross-inspect system state outcomes inside Verification Engine
                verified_success, verification_errs, log_analysis = self.verification.verify_action_success(cmd, exec_stdout, success_exec)
                
                if verified_success:
                    step_success = True
                    step_output = exec_stdout
                    feedback_analysis = "Verification verified file outputs and parsing syntax rules correctly."
                    break
                else:
                    # Capture exact error string details for diagnostic repairs
                    error_signature = f"Execution output: {exec_stdout} | Verification alerts: {verification_errs}"
                    categories = log_analysis.get("detected_error_categories", [])
                    
                    # Manage retry backoff schedules and evaluate remedies
                    can_retry, backoff_seconds, remedy = self.verification.manage_failure_retry(step_uuid, error_signature, categories)
                    
                    if can_retry:
                        logger.warning(f"Verification of Step '{step_uuid}' failed! Corrective advice: '{remedy['explanation']}'. Retrying in {backoff_seconds:.2f}s...")
                        time.sleep(backoff_seconds)
                        
                        # Apply dynamic overrides suggested by the planner/remedy engine
                        if remedy.get("suggested_command_override"):
                            cmd = remedy["suggested_command_override"]
                    else:
                        step_output = exec_stdout
                        feedback_analysis = f"Step failed permanently after 3 verification trials. Errors: {error_signature}"
                        break

            # -------------------------------------------------------------
            # STEP 5: SAVE MEMORY & PERSIST IN DATABASE
            # -------------------------------------------------------------
            if step_success:
                self._record_step_progress(execution_report, pipeline_id, step_uuid, step_statement, inferred_action, cmd, "success", step_output)
            else:
                # -------------------------------------------------------------
                # INTERMEDIATE RECOVERY: REVERSION CASCADE (ROLLBACK)
                # -------------------------------------------------------------
                self._record_step_progress(execution_report, pipeline_id, step_uuid, step_statement, inferred_action, cmd, "failed", feedback_analysis)
                logger.critical(f"Step '{step_uuid}' encountered fatal error. Spawning secure rollback rollback sequence...")
                
                # Decommission active modifications and restore baseline files sandbox
                self.cognition.trigger_incident_rollback(pipeline_id)
                self.security.restore_rollback_snapshot(f"{pipeline_id}_baseline")
                
                execution_report["status"] = "failed"
                execution_report["summary_feedback"] = f"Plan halted due to error executing step: '{step_statement}'. Sandbox safely restored to baseline."
                
                # Save fail metrics to state progress manager
                self.state_tracker.upsert_task_state(pipeline_id, original_prompt, "failed", step_uuid)
                return execution_report

        # -------------------------------------------------------------
        # STEP 6: REPORT ENRICHED COMPLETION
        # -------------------------------------------------------------
        completion_msg = f"Successfully satisfied complex instructions sequence: completed all {len(steps)} active checkpoints."
        execution_report["summary_feedback"] = completion_msg
        
        # Save complete states inside databases
        self.state_tracker.upsert_task_state(pipeline_id, original_prompt, "completed", "done")
        
        # Passive idle GC of modules scheduler to reduce background battery drain
        self.scheduler.mark_module_inactive("coding_assistant")
        self.scheduler.mark_module_inactive("automation_exec")
        self.scheduler.mark_module_inactive("reasoning_llm")

        return execution_report

    def _record_step_progress(self, report: Dict[str, Any], pipeline_id: str, step_uuid: str, prompt: str, action: str, cmd: str, status: str, log: str):
        """Appends record parameters into structural logs metrics and database rows."""
        report["steps_taken"].append({
            "step_query": prompt,
            "action_intent": action,
            "command_proposed": cmd,
            "status": status,
            "log_message": log[:500] if log else ""
        })
        self.cognition.update_task_state_and_snapshot(pipeline_id, step_uuid, status, log)
        self.state_tracker.log_micro_step_run(pipeline_id, step_uuid, cmd, log, status)


if __name__ == "__main__":
    # Test execution engine pipeline manually with sample files commands
    shield_test = SecurityEngine(sandbox_root="./test_task_sandbox")
    cmd_test = CommandEngine("./test_task_sandbox")
    tasker = TaskEngine(shield_test, cmd_test, db_path="./database/test_runner_progress.db", sandbox_path="./test_task_sandbox")
    
    comp_goal = "create file test.py with content 'print(1)' and organize downloads"
    res = tasker.plan_and_execute_goal(comp_goal)
    import json
    print("Test Outcome Report:\n", json.dumps(res, indent=2))
    
    import shutil
    shutil.rmtree("./test_task_sandbox", ignore_errors=True)
    if os.path.exists("./database"):
        shutil.rmtree("./database", ignore_errors=True)
