"""
JARVIS-OS Workflow Optimizer
Analyzes planning graphs and execution paths to eliminate redundant steps and optimize task sequencing.
"""
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WorkflowOptimizer")


class WorkflowOptimizer:
    """Optimizes step dependencies and removes unnecessary overlapping actions before execution cycles."""

    def __init__(self):
        pass

    def optimize_sequence(self, steps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Scans decomposed task plans and prunes duplicate operations."""
        if len(steps) <= 1:
            return steps

        optimized = []
        seen_actions = set()

        for step in steps:
            action_tag = step.get("inferred_action", "CONVERSE")
            statement = step.get("statement", "").lower()

            # 1. Eliminate Duplicate Reads / Inspections
            if action_tag == "LIST_FILES" and "list_files" in seen_actions:
                logger.info(f"OPTIMIZER TRIGGERED: Pruning duplicate directory inspection step: '{step['id']}'")
                continue  # skip redundant double inspection

            # 2. Prevent Duplicate File Deletions
            if action_tag == "FILE_DELETE":
                # Check if we have already scheduled a delete on the same filename in this batch
                filename = self._extract_word_arg(statement, "file") or self._extract_word_arg(statement, "delete")
                if filename:
                    key = f"delete_{filename}"
                    if key in seen_actions:
                        logger.info(f"OPTIMIZER TRIGGERED: Suppressing redundant file deletion step: '{step['id']}'")
                        continue
                    seen_actions.add(key)

            # Record action as registered
            seen_actions.add(action_tag)
            optimized.append(step)

        # Re-index scheduling order indices to ensure sequence consistency
        for idx, opt_step in enumerate(optimized):
            opt_step["order"] = idx + 1
            opt_step["id"] = f"step_{idx + 1}"
            if idx > 0:
                opt_step["dependencies"] = [f"step_{idx}"]
            else:
                opt_step["dependencies"] = []

        return optimized

    def _extract_word_arg(self, query: str, keyword: str) -> str:
        """Helper to peel parameters from literal step statements."""
        words = query.split()
        try:
            idx = words.index(keyword)
            if idx + 1 < len(words):
                return words[idx + 1]
        except ValueError:
            pass
        return ""


if __name__ == "__main__":
    optimizer = WorkflowOptimizer()
    sample_plan = [
        {"id": "step_1", "order": 1, "inferred_action": "LIST_FILES", "statement": "list all files in sandbox"},
        {"id": "step_2", "order": 2, "inferred_action": "FILE_CREATE", "statement": "create file log.txt"},
        {"id": "step_3", "order": 3, "inferred_action": "LIST_FILES", "statement": "show files in workspace again"}
    ]
    opt_plan = optimizer.optimize_sequence(sample_plan)
    import json
    print(json.dumps(opt_plan, indent=2))
