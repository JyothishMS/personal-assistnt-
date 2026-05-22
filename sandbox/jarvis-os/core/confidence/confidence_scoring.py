"""
JARVIS-OS Confidence Scoring System
Evaluates runtime confidence by intersecting linguistic ambiguities with historical process execution indexes.
"""
import logging
from typing import Dict, Any

from core.confidence.uncertainty_detector import UncertaintyDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ConfidenceScoring")


class ConfidenceScoring:
    """Intersects linguistic uncertainty and execution stability history to score action confidence."""

    def __init__(self):
        self.detector = UncertaintyDetector()

    def calculate_confidence(self, user_query: str, command: str, command_historical_success_rate: float = 90.0) -> Dict[str, Any]:
        """Calculates dynamic execution confidence ratio (from 0.0 to 1.0)."""
        # Get linguistic uncertainty metrics
        unc_data = self.detector.detect_uncertainty(user_query, command)
        uncertainty = unc_data.get("uncertainty_score", 0.0)

        # Baseline confidence is inverse of linguistic uncertainty intersected with empirical hardware stability
        empirical_coefficient = command_historical_success_rate / 100.0

        confidence_score = (1.0 - uncertainty) * empirical_coefficient

        # Cap constraints
        confidence_score = max(0.0, min(confidence_score, 1.0))

        # Decision threshold bounds
        autonomous_clearance = confidence_score >= 0.70

        verdict = "SUPERVISED_CLARIFICATION_REQUIRED" if not autonomous_clearance else "AUTONOMOUS_EXECUTION_CLEARED"

        logger.info(f"Dynamic Confidence Index: {confidence_score:.2f} ({verdict})")

        return {
            "confidence_score": round(confidence_score, 2),
            "verdict": verdict,
            "can_execute_autonomously": autonomous_clearance,
            "detected_semantic_issues": unc_data.get("detected_issues", []),
            "reasons": [
                f"Linguistic uncertainty factor: {uncertainty}",
                f"Empirical command success likelihood: {command_historical_success_rate}%"
            ]
        }


if __name__ == "__main__":
    scorer = ConfidenceScoring()
    # High confidence test
    print(scorer.calculate_confidence("Create file info.json", "create_file info.json", 95))
    # Low confidence test due to words ambiguity
    print(scorer.calculate_confidence("Can we maybe wipe out something someday", "delete", 85))
