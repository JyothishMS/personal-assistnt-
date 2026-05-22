"""
JARVIS-OS Task State Manager
Maintains overall goals progression states on disk databases, allowing interrupted threads to restore and resume.
"""
import os
import sqlite3
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TaskStateManager")


class TaskStateManager:
    """Supervises active, paused, or suspended operating tasks across session boots."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db"):
        self.db_path = db_path
        self._initialize_database_tables()

    def _get_connection(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _initialize_database_tables(self):
        """Prepares database schemas to record high-level tasks."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS task_log (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pipeline_id TEXT UNIQUE,
                        goal_description TEXT,
                        status TEXT,
                        current_step_id TEXT,
                        timestamp REAL,
                        updated_timestamp REAL
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS step_execution_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pipeline_id TEXT,
                        step_id TEXT,
                        command_query TEXT,
                        execution_log TEXT,
                        status TEXT,
                        timestamp REAL
                    )
                """)
                conn.commit()
            logger.info("Task State Manager datastores verified. Schema integrity sound.")
        except Exception as e:
            logger.error(f"Failed task db migrations: {e}")

    def upsert_task_state(self, pipeline_id: str, goal: str, status: str, current_step_id: str) -> bool:
        """Saves or resets overall goal checkpoint index keys inside SQLite datastore."""
        import time
        now = time.time()
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO task_log (pipeline_id, goal_description, status, current_step_id, timestamp, updated_timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(pipeline_id) DO UPDATE SET
                        status = excluded.status,
                        current_step_id = excluded.current_step_id,
                        updated_timestamp = excluded.updated_timestamp
                """, (pipeline_id, goal, status, current_step_id, now, now))
                conn.commit()
            return True
        except Exception as e:
            logger.error(f"SQLite transaction aborted: {e}")
            return False

    def log_micro_step_run(self, pipeline_id: str, step_id: str, cmd: str, log: str, outcome: str) -> bool:
        """Appends granular file-system step attempt lines into structured audit log databases."""
        import time
        now = time.time()
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO step_execution_history (pipeline_id, step_id, command_query, execution_log, status, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (pipeline_id, step_id, cmd, log[:8000], outcome, now))
                conn.commit()
            return True
        except Exception as e:
            logger.error(f"Cannot write step logs to SQLite: {e}")
            return False

    def query_active_uncompleted_pipelines(self) -> List[Dict[str, Any]]:
        """Identifies tasks state tables rows that were left running or incomplete."""
        active = []
        try:
            with self._get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT pipeline_id, goal_description, status, current_step_id FROM task_log WHERE status IN ('active', 'suspended')")
                for row in cursor.fetchall():
                    active.append({
                        "pipeline_id": row["pipeline_id"],
                        "goal": row["goal_description"],
                        "status": row["status"],
                        "current_step": row["current_step_id"]
                    })
        except Exception as e:
            logger.error(f"Could not discover running routines: {e}")
        return active

    def query_step_execution_history(self, pipeline_id: str) -> List[Dict[str, Any]]:
        """Returns ordered attempts reports for checking error signatures."""
        runs = []
        try:
            with self._get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT step_id, command_query, execution_log, status, timestamp FROM step_execution_history WHERE pipeline_id = ? ORDER BY id ASC", (pipeline_id,))
                for row in cursor.fetchall():
                    runs.append({
                        "step_id": row["step_id"],
                        "command": row["command_query"],
                        "log": row["execution_log"],
                        "status": row["status"],
                        "timestamp": row["timestamp"]
                    })
        except Exception as e:
            logger.error(f"Cannot select system runs logs: {e}")
        return runs


if __name__ == "__main__":
    tsm = TaskStateManager("./database/test_runner_progress.db")
    tsm.upsert_task_state("pip-9988", "Run heavy diagnostics", "active", "step_1")
    tsm.log_micro_step_run("pip-9988", "step_1", "execute tests", "all green", "success")
    print("Pending uncompleted tasks:", tsm.query_active_uncompleted_pipelines())
    
    import shutil
    shutil.rmtree("./database", ignore_errors=True)
