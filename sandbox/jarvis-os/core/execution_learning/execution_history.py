"""
JARVIS-OS Execution History Tracker
Maintains historical execution logs, compiling metadata regarding command success rates, delays, and errors.
"""
import os
import sqlite3
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ExecutionHistory")


class ExecutionHistory:
    """Manages transactional records of system executions, sorting paths by latency and success ratios."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db"):
        self.db_path = db_path
        self._ensure_history_tables()

    def _get_connection(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _ensure_history_tables(self):
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS command_execution_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        command TEXT,
                        exit_status TEXT, -- 'success' or 'failure'
                        stderr TEXT,
                        latency_ms INTEGER,
                        retries INTEGER DEFAULT 0
                    )
                """)
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to create execution log DB schemas: {e}")

    def log_execution(self, command: str, exit_status: str, stderr: str, latency_ms: int, retries: int = 0):
        """Commits run metadata to record the stability profiles of custom user scripts."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO command_execution_logs (command, exit_status, stderr, latency_ms, retries)
                    VALUES (?, ?, ?, ?, ?)
                """, (command, exit_status, stderr, latency_ms, retries))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to log execution metrics: {e}")

    def query_recent_execution_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves history of sandboxed executions."""
        logs = []
        if not os.path.exists(self.db_path):
            return logs
        try:
            with self._get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM command_execution_logs ORDER BY id DESC LIMIT ?", (limit,))
                for row in cursor.fetchall():
                    logs.append(dict(row))
        except Exception as e:
            logger.error(f"Failed to read execution logs: {e}")
        return logs


if __name__ == "__main__":
    eh = ExecutionHistory("./database/test_exec.db")
    eh.log_execution("list_files", "success", "", 120, 0)
    print(eh.query_recent_execution_logs(1))
    import shutil
    shutil.rmtree("./database", ignore_errors=True)
