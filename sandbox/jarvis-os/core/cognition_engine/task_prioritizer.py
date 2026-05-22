"""
JARVIS-OS Task Prioritizer
Examines system loads and dynamically calculates priority weight factors to schedule heavy executions intelligently.
"""
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TaskPrioritizer")


class TaskPrioritizer:
    """Calculates weights for executable items to throttle CPU workloads dynamically."""

    def __init__(self, high_cpu_limit: float = 75.0, low_battery_limit: int = 20):
        self.high_cpu_limit = high_cpu_limit
        self.low_battery_limit = low_battery_limit

    def prioritize_queue(self, steps_queue: List[Dict[str, Any]], system_hardware_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Sorts pending tasks, prioritizing easy calculations during high CPU stress."""
        cpu = system_hardware_metrics.get("cpu_percent", 40.0)
        battery = system_hardware_metrics.get("battery_percent", 100)
        is_unplugged = not system_hardware_metrics.get("battery_plugged", True)

        is_system_stressed = (cpu > self.high_cpu_limit) or (is_unplugged and battery < self.low_battery_limit)
        
        # Assign dynamic weights
        for step in steps_queue:
            intrinsic_cost = self._get_estimated_resource_cost(step.get("inferred_action", "CONVERSE"))
            
            # If the system is highly stressed, penalize highly expensive operations (higher score means lower priority in queue)
            scheduling_weight = intrinsic_cost
            if is_system_stressed and intrinsic_cost > 5:
                # Add delay weights to postpone heavy compiles
                scheduling_weight += 15
                step["schedule_deferral_recommended"] = True
            else:
                step["schedule_deferral_recommended"] = False

            step["scheduling_weight"] = scheduling_weight

        # Sort queue: smaller weight comes first
        sorted_queue = sorted(steps_queue, key=lambda x: (x.get("scheduling_weight", 5), x.get("order", 0)))
        
        logger.info(f"Task Prioritizer re-calculated active queue order. System stressed: {is_system_stressed}.")
        return sorted_queue

    def _get_estimated_resource_cost(self, action_tag: str) -> int:
        """Determines fixed scoring representing compute intensiveness (scale 1 to 10)."""
        costs = {
            "FILE_CREATE": 2,       # Low write operations
            "LIST_FILES": 1,        # Minimal index search
            "FILE_DELETE": 2,       # Fast file unlink
            "CONVERSE": 3,          # Simple chatbot token rendering
            "ORGANIZE_FOLDER": 6,   # Disks moving and directories recursion
            "OPEN_APP": 8,          # Heavy spawning of system widgets
        }
        return costs.get(action_tag, 4)


if __name__ == "__main__":
    prioritizer = TaskPrioritizer()
    test_queue = [
        {"id": "step_1", "order": 1, "inferred_action": "OPEN_APP"},
        {"id": "step_2", "order": 2, "inferred_action": "FILE_CREATE"},
        {"id": "step_3", "order": 3, "inferred_action": "ORGANIZE_FOLDER"}
    ]
    sys_stressed = {"cpu_percent": 88.0, "battery_percent": 15, "battery_plugged": False}
    sys_nominal = {"cpu_percent": 12.0, "battery_percent": 90, "battery_plugged": True}

    print("STRESSED ORDER:")
    for s in prioritizer.prioritize_queue(test_queue, sys_stressed):
        print(f"  ID: {s['id']} | Cost: {s['scheduling_weight']} | Defer: {s['schedule_deferral_recommended']}")

    print("\nNOMINAL ORDER:")
    for s in prioritizer.prioritize_queue(test_queue, sys_nominal):
        print(f"  ID: {s['id']} | Cost: {s['scheduling_weight']} | Defer: {s['schedule_deferral_recommended']}")
