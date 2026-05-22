"""
JARVIS-OS Module Scheduler
Manages modular resource scaling, activates/deactivates coding, voice, and reasoning states, and throttles idle power draw.
"""
import time
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ModuleScheduler")


class ModuleScheduler:
    """Manages active engine modules on thread loops to minimize static background memory footprints and CPU heat."""

    def __init__(self, high_cpu_limit: float = 75.0, idle_loop_timeout: float = 2.5):
        self.high_cpu_limit = high_cpu_limit
        self.idle_loop_timeout = idle_loop_timeout
        # Controls state variables of separate modular threads
        self.module_states: Dict[str, Dict[str, Any]] = {
            "voice_listener": {"loaded": False, "active": False, "last_used": 0.0},
            "coding_assistant": {"loaded": False, "active": False, "last_used": 0.0},
            "automation_exec": {"loaded": False, "active": False, "last_used": 0.0},
            "reasoning_llm": {"loaded": False, "active": False, "last_used": 0.0}
        }
        self.last_activity_time = time.time()
        logger.info("Module Scheduler online. Resource throttling boundaries calibrated.")

    def optimize_system_cycles(self, current_telemetry: Dict[str, Any]) -> float:
        """Determines ideal loop ticking interval to trade latency for battery conservation on laptops."""
        cpu = current_telemetry.get("cpu_percent", 20.0)
        time_since_action = time.time() - self.last_activity_time

        # Idle timeout garbage collection
        self._unload_stale_modules()

        # If CPU is high or system is quiet, stretch tick rate to let core processors rest
        if cpu > self.high_cpu_limit:
            logger.warning(f"Extreme Host CPU load detected: {cpu}%. Aggressive execution decay engaged.")
            return 3.0  # Ultra slow cycling to preserve energy
            
        if time_since_action > 60.0:
            # Sleep aggressively when user has walked away
            return self.idle_loop_timeout

        return 1.0  # Default prompt interactive tick rate (1s)

    def request_module_activation(self, module_name: str) -> bool:
        """Warms up and loads specific sub-engines dynamically prior to high-performance tasks."""
        if module_name not in self.module_states:
            logger.error(f"Failed activation: '{module_name}' is not in sovereign schedule register.")
            return False

        module = self.module_states[module_name]
        module["last_used"] = time.time()
        self.last_activity_time = time.time()

        if not module["loaded"]:
            logger.info(f"LAZY LOADING INITIATED: Warming up thread registers for heavy module: '{module_name}'...")
            module["loaded"] = True
            module["active"] = True
            return True
            
        if not module["active"]:
            logger.info(f"Re-activating loaded module: '{module_name}'")
            module["active"] = True
            
        return True

    def mark_module_inactive(self, module_name: str):
        """Disengages active state while retaining the loaded engine cache in RAM memory."""
        if module_name in self.module_states:
            self.module_states[module_name]["active"] = False
            logger.info(f"Marked active state of '{module_name}' as False (Idle mode).")

    def get_scheduling_report(self) -> Dict[str, Any]:
        """Provides status details regarding active allocations."""
        return {
            "uptime_since_refreshed": round(time.time() - self.last_activity_time, 1),
            "allocated_load_count": sum(1 for k, v in self.module_states.items() if v["loaded"]),
            "active_processing_count": sum(1 for k, v in self.module_states.items() if v["active"]),
            "module_states": self.module_states
        }

    def _unload_stale_modules(self):
        """Reclaims system memory footprint by offloading modules that have been idle for more than 45 seconds."""
        cutoff_seconds = 45.0
        now = time.time()
        for name, spec in self.module_states.items():
            if spec["loaded"] and not spec["active"]:
                idle_duration = now - spec["last_used"]
                if idle_duration > cutoff_seconds:
                    logger.info(f"RECLAIMING RESOURCES: Garbage collection unloading inactive '{name}' (Idle for {idle_duration:.1f}s)")
                    spec["loaded"] = False
                    spec["active"] = False


if __name__ == "__main__":
    scheduler = ModuleScheduler()
    # Mock system actions sequence
    scheduler.request_module_activation("reasoning_llm")
    print("Report:", scheduler.get_scheduling_report())
    
    # Simulating idle passage
    scheduler.module_states["reasoning_llm"]["last_used"] = time.time() - 50.0  # Mock past activity
    scheduler.module_states["reasoning_llm"]["active"] = False
    scheduler._unload_stale_modules()
    print("Post GC Report:", scheduler.get_scheduling_report())
