"""
JARVIS-OS Execution Scoring
Evaluates individual command and workflow results to score system health and task performance.
"""
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ExecutionScoring")


class ExecutionScoring:
    """Provides algorithms to dynamically score execution health based on exit states and latency."""

    def __init__(self):
         pass

    def evaluate_command_execution(self, is_success: bool, stderr: str, retries_taken: int, latency_seconds: float) -> Dict[str, Any]:
        """Calculates a detailed quality score (from 0 to 100) for a specific command execution."""
        base_score = 100
        penalties = []

        # Success penalty
        if not is_success:
            base_score -= 50
            penalties.append("Command execution returned an failure status (-50)")

        # Error log content review
        std_low = stderr.lower()
        if "syntax" in std_low:
            base_score -= 15
            penalties.append("Grammar/Syntax compile warnings (-15)")
        if "denied" in std_low or "permission" in std_low:
            base_score -= 20
            penalties.append("Privilege validation restrictions encountered (-20)")

        # Retries penalty
        if retries_taken > 0:
            retry_penalty = min(retries_taken * 10, 30)
            base_score -= retry_penalty
            penalties.append(f"Multiple loop verification retries ({retries_taken} retries) (-{retry_penalty})")

        # Computational speed scaling (penalize slow scripts)
        if latency_seconds > 5.0:
            base_score -= 10
            penalties.append("Slower thread execution latency > 5s (-10)")

        final_score = max(base_score, 0)
        grade = "A" if final_score >= 90 else ("B" if final_score >= 75 else ("C" if final_score >= 50 else "D"))

        return {
            "score": final_score,
            "grade": grade,
            "penalties_incurred": penalties,
            "latency_sec": round(latency_seconds, 2),
            "healthy_verdict": final_score >= 75
        }

    def aggregate_workflow_score(self, step_scores_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregates scores from sequential pipeline checkpoints to rate general cognitive stability."""
        if not step_scores_records:
            return {"average_score": 100.0, "workflow_grade": "A", "verdict": "Nominal Perfect State"}

        score_sum = sum(s.get("score", 100) for s in step_scores_records)
        avg = score_sum / len(step_scores_records)
        
        grade = "A" if avg >= 95 else ("B" if avg >= 80 else ("C" if avg >= 60 else "D"))
        
        return {
            "average_score": round(avg, 1),
            "workflow_grade": grade,
            "total_micro_checkpoints": len(step_scores_records),
            "operational_verdict": "Nominal State" if avg >= 80 else "Performance Degradation Warning"
        }


if __name__ == "__main__":
    scorer = ExecutionScoring()
    single_res = scorer.evaluate_command_execution(True, "Some nonfatal warning lines", 1, 1.4)
    print(single_res)
