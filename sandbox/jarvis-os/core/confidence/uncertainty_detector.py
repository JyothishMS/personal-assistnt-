"""
JARVIS-OS Uncertainty Detector
Evaluates user prompts and commands for syntax gaps, missing targets, or ambiguous request wording.
"""
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("UncertaintyDetector")


class UncertaintyDetector:
    """Highlights potential ambiguities and missing command arguments that suggest need for confirmation."""

    def __init__(self):
        # Linguistic fuzzy indicators
        self.fuzzy_terms = [
            "somehow", "maybe", "perchance", "probably", "possibly", "guess",
            "not sure", "or something", "or whatever", "kind of", "somewhere"
        ]

    def detect_uncertainty(self, text: str, command: str = "") -> Dict[str, Any]:
        """Analyzes text semantics and instruction completeness to quantify ambiguity levels."""
        text_low = text.lower()
        ambiguities = []
        score_accumulator = 0.0

        # 1. Look for hesitant words
        for term in self.fuzzy_terms:
            if term in text_low:
                ambiguities.append(f"Contains hesitant phrasing indicator: '{term}'")
                score_accumulator += 0.25

        # 2. Check for missing targets in common instructions
        if "delete" in text_low or "erase" in text_low or "remove" in text_low:
            # If command doesn't name a file target
            if not command or len(command.split()) < 2:
                ambiguities.append("Irreversible deletion instruction lacks a specific filename or folder target.")
                score_accumulator += 0.40

        if "write" in text_low or "create" in text_low or "save" in text_low:
            if not command or len(command.split()) < 2:
                ambiguities.append("Content creation request has no target workspace file name parameter.")
                score_accumulator += 0.30

        # Normalize confidence threshold (max 1.0)
        uncertainty_score = min(score_accumulator, 1.0)
        is_clear = uncertainty_score < 0.40

        logger.info(f"Uncertainty rating computed: Score={uncertainty_score}. Ambiguities identified: {len(ambiguities)}")

        return {
            "uncertainty_score": round(uncertainty_score, 2),
            "is_semantically_clear": is_clear,
            "detected_issues": ambiguities,
            "clarification_recommended": not is_clear
        }


if __name__ == "__main__":
    detector = UncertaintyDetector()
    print(detector.detect_uncertainty("Maybe we could erase some code or whatever", "delete"))
    print(detector.detect_uncertainty("Create file list.txt with content 'done'", "create_file list.txt 'done'"))
