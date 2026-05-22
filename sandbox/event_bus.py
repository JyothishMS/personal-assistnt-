import time
import json
import os
import queue
import logging
from typing import Dict, List, Callable, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [EventBus] - %(levelname)s - %(message)s")
logger = logging.getLogger("EventBus")

class Event:
    """Represents a discrete system event flowing through the JARVIS OS cognitive stream."""
    def __init__(self, event_type: str, source: str, data: Dict[str, Any] = None, priority: str = "MEDIUM"):
        self.event_id = f"EVT-{int(time.time() * 1000)}"
        self.timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        self.event_type = event_type.upper()  # e.g., "HEALTH_FALL", "THREAT_DETECTED", "TASK_COMPLETED"
        self.source = source                  # e.g., "SmartwatchSensor", "SentinelCCTV", "AIEngine"
        self.data = data or {}
        self.priority = priority.upper()      # CRITICAL, HIGH, MEDIUM, LOW

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "timestamp": self.timestamp,
            "event_type": self.event_type,
            "source": self.source,
            "priority": self.priority,
            "data": self.data
        }

class EventBus:
    """An offline event bus broker for dispatching sovereign alerts, sensory triggers, and task updates."""
    def __init__(self, persist_path: str = "./sandbox/event_history.json"):
        self.subscribers: Dict[str, List[Callable[[Event], None]]] = {}
        self.event_queue = queue.PriorityQueue()
        self.persist_path = persist_path
        self.active = True
        logger.info("Sovereign Event Bus online. Ready to register local listeners.")

    def subscribe(self, event_type: str, callback: Callable[[Event], None]):
        """Register an agent or sub-engine module callback for a specific event channel."""
        event_type = event_type.upper()
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
        logger.info(f"Source module subscribed to event channel: '{event_type}'")

    def publish(self, event: Event):
        """Publish a system event locally. Logs, persists, and triggers subscribers matching the topic."""
        # Convert priority to numeric score for queue prioritizing
        priority_map = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}
        prio_score = priority_map.get(event.priority, 3)
        
        self.event_queue.put((prio_score, time.time(), event))
        logger.info(f"Published event: '{event.event_type}' [{event.priority}] from source: {event.source}")
        
        # Persist event log to disk
        self._persist_event(event)

        # Synchronously notify active handlers in sandbox simulation
        self._dispatch(event)

    def _dispatch(self, event: Event):
        # Notify specific channel subscribers
        if event.event_type in self.subscribers:
            for callback in self.subscribers[event.event_type]:
                try:
                    callback(event)
                except Exception as e:
                    logger.error(f"Error handling event dispatch '{event.event_type}' callback: {e}")

        # Notify wildcard listeners
        if "*" in self.subscribers:
            for callback in self.subscribers["*"]:
                callback(event)

    def _persist_event(self, event: Event):
        try:
            history = []
            if os.path.exists(self.persist_path):
                with open(self.persist_path, "r") as f:
                    try:
                        history = json.load(f)
                    except json.JSONDecodeError:
                        history = []
            
            history.append(event.to_dict())
            
            # Keep log file size bounded
            if len(history) > 100:
                history = history[-100:]

            with open(self.persist_path, "w") as f:
                json.dump(history, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist event history log: {e}")

# Simple system scenario mock initialization
if __name__ == "__main__":
    bus = EventBus()

    # Define simple mock action agents
    def sentinel_safety_responder(evt: Event):
        print(f"\n[AGENT RESCRIPT] Sentinel Engine intercepted emergency trigger!")
        print(f"Detail: Alerting authorities on safety threat - {evt.data.get('threat_type')}")
        print(f"Action: Deploying tactical routing coordinates to visual console.\n")

    def generic_logger(evt: Event):
        print(f"[SYSTEM LOG] Timestamp: {evt.timestamp} | {evt.event_type} priority level={evt.priority}")

    # Register subscribers
    bus.subscribe("THREAT_DETECTED", sentinel_safety_responder)
    bus.subscribe("*", generic_logger)

    # Publish standard events
    test_evt_1 = Event("THREAT_DETECTED", "CCTVScanEngine", {"threat_type": "Prohibited Perimeter Breached", "location": "Sector G"}, "HIGH")
    bus.publish(test_evt_1)

    time.sleep(0.5)

    test_evt_2 = Event("DEVICE_UPTIME_OK", "HardwareTelemetry", {"kernel_state": "Sovereign Layer Secure"}, "LOW")
    bus.publish(test_evt_2)
