import time
import json
import os
import random
import logging
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [SentinelHealthEngine] - %(levelname)s - %(message)s")
logger = logging.getLogger("SentinelHealth")

class HealthMetric:
    """Represents real-time biometric feed data flowing from a user's smartwatch or phone sensor."""
    def __init__(self, heart_rate: int, systolic: int, temperature: float, activity_state: str):
        self.timestamp = time.strftime("%H:%M:%S")
        self.heart_rate = heart_rate            # Beats per Minute (BPM)
        self.systolic_pressure = systolic       # Blood pressure parameter (mmHg)
        self.body_temperature = temperature     # Celsius degrees
        self.activity_state = activity_state     # IDLE, WALKING, EXERCISING, FALLING, STILL

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "heart_rate": self.heart_rate,
            "systolic_pressure": self.systolic_pressure,
            "body_temperature": self.body_temperature,
            "activity_state": self.activity_state
        }

class SentinelSafety:
    """Monitoring hub coordinating wearable smartwatch biosensors and Sentinel CCTV threat classification."""
    def __init__(self, db_path: str = "./sandbox/jarvis_memory.json"):
        self.db_path = db_path
        logger.info("Sentinel Safety and Health AI Hub engaged on local thread.")

    def scan_biometrics(self) -> Dict[str, Any]:
        """Simulates incoming wearables signals and returns active anomalies."""
        # Baseline normal values
        hr = random.randint(68, 76)
        bp = random.randint(114, 122)
        temp = round(random.uniform(36.4, 36.8), 1)
        activity = "IDLE"

        # Inject telemetry spikes occasionally to simulate active monitoring
        time_factor = int(time.time()) % 60
        anomaly_detected = False
        anomaly_type = None
        severity = "LOW"
        narrative = "Heart-rate healthy. Normal smartwatch telemetry bounds."

        if time_factor in range(15, 20):
            hr = random.randint(135, 142)  # High heart rate
            activity = "EXERCISING"
            narrative = "High exertion detected. Physical health parameters are normal for intensive activity."
        elif time_factor in range(35, 40):
            # Simulated FALL DETECTED!
            hr = random.randint(105, 115)
            bp = random.randint(90, 95)
            activity = "FALLING"
            anomaly_detected = True
            anomaly_type = "CRITICAL_FALL_DETECTION"
            severity = "CRITICAL"
            narrative = "IMMEDIATE ALERT: High-impact deceleration vector mapped by watch accelerometer. Unresponsive stillness recorded."

        metric = HealthMetric(hr, bp, temp, activity)

        return {
            "metrics": metric.to_dict(),
            "anomaly_detected": anomaly_detected,
            "anomaly_type": anomaly_type,
            "severity": severity,
            "message": narrative
        }

    def scan_video_feed(self, camera_id: str) -> Dict[str, Any]:
        """Simulates CCTV and local device camera visual threat classification."""
        threat_classes = ["UNAUTHORIZED_ACCESS", "PACKAGE_DELIVERY", "ANOMALOUS_FIRE_SIGNATURE", "NONE"]
        
        # Consistent simulated classifications depending on the current minutes
        factor = int(time.time() / 10) % len(threat_classes)
        detected_threat = threat_classes[factor]
        
        severity = "LOW"
        narrative = "No movement or physical threats detected on video channel."
        trigger_warning = False

        if detected_threat == "UNAUTHORIZED_ACCESS":
            trigger_warning = True
            severity = "HIGH"
            narrative = "CCTV WARNING: Human silhouette identified crossing perimeter fence after hours."
        elif detected_threat == "ANOMALOUS_FIRE_SIGNATURE":
            trigger_warning = True
            severity = "CRITICAL"
            narrative = "EMERGENCY: Thermal pixel values exceed standard threshold limit in primary server cluster sector."

        return {
            "camera_id": camera_id,
            "timestamp": time.strftime("%H:%M:%S"),
            "classified_threat": detected_threat,
            "trigger_warning": trigger_warning,
            "severity": severity,
            "narrative": narrative
        }

    def generate_incident_payload(self, title: str, description: str, severity: str, source: str) -> Dict[str, Any]:
        """Formulates standard JSON parameters for reporting a threat directly to Incident Control Center database."""
        incident_id = f"INC-{time.strftime('%Y%m%d')}-{random.randint(100, 999)}"
        return {
            "id": incident_id,
            "title": title,
            "description": description,
            "severity": severity.upper(),
            "status": "ACTIVE",
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "affectedFiles": [source],
            "evidenceUrl": ""
        }

if __name__ == "__main__":
    sentinel = SentinelSafety()
    
    # Run simple simulations
    print("=== MONITORING WEARABLE BIOMETRICS ===")
    for _ in range(3):
        res = sentinel.scan_biometrics()
        print(f"Metrics: HR: {res['metrics']['heart_rate']} BPM | Temp: {res['metrics']['body_temperature']}C | State: {res['metrics']['activity_state']}")
        if res["anomaly_detected"]:
            print(f"*** {res['severity']} ANOMALY TRIGGERED: {res['message']} ***")
        time.sleep(0.5)

    print("\n=== SCANNING CCTV PERIMETER THREADS ===")
    for c_id in ["cam-01", "cam-02"]:
        res_v = sentinel.scan_video_feed(c_id)
        print(f"Channel: {res_v['camera_id']} -> Threat Class: {res_v['classified_threat']} [{res_v['severity']}]")
        print(f"Details: {res_v['narrative']}")
