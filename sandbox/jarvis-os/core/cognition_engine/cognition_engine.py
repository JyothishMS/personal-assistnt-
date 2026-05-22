"""
JARVIS-OS Cognition Engine
Coordinates planning, task prioritization, and workflow state persistence under one unified cognitive interface.
"""
import uuid
import logging
from typing import List, Dict, Any, Tuple

from core.cognition_engine.planner import CognitionPlanner
from core.cognition_engine.workflow_manager import WorkflowManager
from core.cognition_engine.task_prioritizer import TaskPrioritizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CognitionEngine")


class CognitionEngine:
    """The central neurological coordination workspace for JARVIS-OS."""

    def __init__(self, checkpoints_dir: str = "./database/checkpoints"):
        self.planner = CognitionPlanner()
        self.workflow_mgr = WorkflowManager(checkpoints_dir)
        self.prioritizer = TaskPrioritizer()
        logger.info("Cognition Engine online. All neurological pathways mapped and ready.")

    def construct_unifying_workflow(self, raw_input_prompt: str, current_system_metrics: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """Takes raw user prompts, generates structural steps list, runs hardware optimization, and registers in persistent checkpoints."""
        pipeline_id = f"pip-{uuid.uuid4().hex[:8]}"
        
        # 1. Plan raw steps list
        initial_steps = self.planner.construct_plan(raw_input_prompt)
        
        # 2. Prioritize & sequence according to laptop CPU metric weights
        prioritized_steps = self.prioritizer.prioritize_queue(initial_steps, current_system_metrics)
        
        # 3. Register final pipeline and save database checkpoint
        pipeline = self.workflow_mgr.register_pipeline(pipeline_id, raw_input_prompt, prioritized_steps)
        
        logger.info(f"Neurological solver finalized. Pipeline '{pipeline_id}' spawned for action loops.")
        return pipeline_id, pipeline

    def update_task_state_and_snapshot(self, pipeline_id: str, step_uuid: str, status: str, result_log: str = "") -> bool:
        """Transitions individual micro step records and persists the new state on disk."""
        return self.workflow_mgr.update_step_status(pipeline_id, step_uuid, status, result_log)

    def trigger_incident_rollback(self, pipeline_id: str) -> List[str]:
        """Runs cascade undo instructions if a secure transaction ends with failure footprints."""
        ok, undo_commands = self.workflow_mgr.cascade_rollback(pipeline_id)
        if ok:
            logger.warning(f"Incident recovery triggered for pipeline '{pipeline_id}'. Running command cascade: {undo_commands}")
            return undo_commands
        return []

    def scan_for_interrupted_workflows(self) -> List[Dict[str, Any]]:
        """Scans for frozen workflows to verify and resume them after sudden shutdowns."""
        return self.workflow_mgr.get_pending_or_interrupted_pipelines()


if __name__ == "__main__":
    ce = CognitionEngine("./test_neuro_check")
    dummy_stats = {"cpu_percent": 15.0, "battery_percent": 99, "battery_plugged": True}
    
    pip_id, info = ce.construct_unifying_workflow("create file script.py and organized downloads", dummy_stats)
    print(f"Goal scheduled under ID: {pip_id}")
    print(f"Steps Order counts: {len(info['steps'])}")
    
    ce.update_task_state_and_snapshot(pip_id, "step_1", "success", "written successfully")
    ce.update_task_state_and_snapshot(pip_id, "step_2", "failed", "out of space disk warning")
    
    undo_list = ce.trigger_incident_rollback(pip_id)
    print("Undo tasks resulting count:", len(undo_list))
    
    import shutil
    shutil.rmtree("./test_neuro_check", ignore_errors=True)
