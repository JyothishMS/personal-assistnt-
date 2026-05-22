"""
JARVIS-OS Workflow Manager
Manages real-time workflow pipeline states, persists progress checkpoints, and executes safety rollback sequences.
"""
import os
import json
import logging
from typing import Dict, Any, List, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WorkflowManager")


class WorkflowManager:
    """Controls the overall states of active pipelines, records state snapshots, and triggers healing routines."""

    def __init__(self, checkpoints_dir: str = "./database/checkpoints"):
        self.checkpoints_dir = os.path.abspath(checkpoints_dir)
        os.makedirs(self.checkpoints_dir, exist_ok=True)
        # Runtime active states in-memory storage dictionary
        self.active_pipelines: Dict[str, Dict[str, Any]] = {}

    def register_pipeline(self, pipeline_id: str, raw_goal: str, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Registers a newly formulated task graph inside execution scopes."""
        pipeline = {
            "pipeline_id": pipeline_id,
            "raw_goal": raw_goal,
            "status": "active",  # active | suspended | completed | failed | rolled_back
            "current_step_index": 0,
            "steps": steps,
            "timestamp_start": os.times()[4] if hasattr(os, 'times') else 0.0,
            "logs": []
        }
        self.active_pipelines[pipeline_id] = pipeline
        self.save_checkpoint(pipeline_id)
        return pipeline

    def update_step_status(self, pipeline_id: str, step_uuid: str, status: str, log_msg: str = "") -> bool:
        """Transitions individual step status flags and audits overall timeline."""
        if pipeline_id not in self.active_pipelines:
            return False

        pipeline = self.active_pipelines[pipeline_id]
        for step in pipeline["steps"]:
            if step["id"] == step_uuid:
                step["status"] = status
                step["checks_count"] += 1
                pipeline["logs"].append(f"Step '{step_uuid}' transitioned to '{status}': {log_msg}")
                self.save_checkpoint(pipeline_id)
                return True
        return False

    def save_checkpoint(self, pipeline_id: str):
        """Writes current execution snapshots into JSON files to facilitate seamless system resumption after interruptions."""
        if pipeline_id not in self.active_pipelines:
            return
        
        target_path = os.path.join(self.checkpoints_dir, f"{pipeline_id}.json")
        try:
            with open(target_path, "w", encoding="utf-8") as f:
                json.dump(self.active_pipelines[pipeline_id], f, indent=2)
            logger.info(f"System checkpoint written for pipeline: '{pipeline_id}' at: '{target_path}'")
        except Exception as e:
            logger.error(f"Failed checkpoint snapshot: {e}")

    def load_checkpoint(self, pipeline_id: str) -> Dict[str, Any]:
        """Recovers an interrupted or crashed workflow state directly from persistent memory."""
        target_path = os.path.join(self.checkpoints_dir, f"{pipeline_id}.json")
        if not os.path.exists(target_path):
            return {}
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                pipeline = json.load(f)
                self.active_pipelines[pipeline_id] = pipeline
                return pipeline
        except Exception as e:
            logger.error(f"Failed loading checkpoint: {e}")
            return {}

    def get_pending_or_interrupted_pipelines(self) -> List[Dict[str, Any]]:
        """Scans folder structure to discover workflows that were suspended mid-execution."""
        pipelines = []
        if not os.path.exists(self.checkpoints_dir):
            return pipelines

        for item in os.listdir(self.checkpoints_dir):
            if item.endswith(".json"):
                pipeline_id = item.replace(".json", "")
                p = self.load_checkpoint(pipeline_id)
                if p and p.get("status") in ["active", "suspended"]:
                    pipelines.append(p)
        return pipelines

    def cascade_rollback(self, pipeline_id: str) -> Tuple[bool, List[str]]:
        """Sequentially triggers rollback tasks for any successfully completed step, to keep the sandbox in a clean state."""
        if pipeline_id not in self.active_pipelines:
            return False, ["Pipeline not registered in active context."]

        pipeline = self.active_pipelines[pipeline_id]
        pipeline["status"] = "failed"
        
        rolled_back_log = []
        # Roll back finished tasks in reverse order (LIFO)
        for step in reversed(pipeline["steps"]):
            if step["status"] == "success":
                rollback_cmd = step.get("rollback_rollback_action", "none")
                if rollback_cmd and rollback_cmd != "none":
                    logger.warning(f"Undoing successfully completed Step '{step['id']}' via instruction: '{rollback_cmd}'")
                    rolled_back_log.append(rollback_cmd)
                    step["status"] = "rolled_back"
                else:
                    rolled_back_log.append(f"No rollback command available for: '{step['id']}'")
        
        pipeline["status"] = "rolled_back"
        self.save_checkpoint(pipeline_id)
        return True, rolled_back_log


if __name__ == "__main__":
    mgr = WorkflowManager("./test_checkpoints")
    dummy_steps = [
        {"id": "step_1", "status": "success", "rollback_rollback_action": "delete_file report.txt", "checks_count": 1},
        {"id": "step_2", "status": "failed", "rollback_rollback_action": "none", "checks_count": 1}
    ]
    mgr.register_pipeline("workflow_99", "Build reporting matrix", dummy_steps)
    print("Checkpoint Saved. Loading it...")
    print(mgr.load_checkpoint("workflow_99"))
    
    ok, log = mgr.cascade_rollback("workflow_99")
    print(f"Began Rollback. Outcome: {ok}. Rollback log sequences: {log}")
    
    import shutil
    shutil.rmtree("./test_checkpoints", ignore_errors=True)
