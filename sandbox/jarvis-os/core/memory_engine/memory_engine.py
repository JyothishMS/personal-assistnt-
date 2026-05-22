"""
JARVIS-OS Memory Engine
SQLite database managing system settings, conversation histories, and automation transaction logs.
"""
import os
import sqlite3
import logging
from typing import List, Dict, Any, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MemoryEngine")


class MemoryEngine:
    """Provides structured persistent storage using SQL transactions."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db"):
        self.db_path = db_path
        # Ensure target database directory exists
        db_dir = os.path.dirname(os.path.abspath(db_path))
        os.makedirs(db_dir, exist_ok=True)
        self.initialize_tables()

    def _get_connection(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def initialize_tables(self):
        """Creates SQLite tables for conversations, actions, and settings if empty."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Table for overall intent/automation histories
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS action_memory (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        category TEXT,
                        user_input TEXT,
                        intent_parsed TEXT,
                        recommended_action TEXT,
                        execution_outcome TEXT,
                        status TEXT
                    )
                """)
                
                # Table for continuous conversations chats
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS chat_log (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        sender TEXT, -- 'user' or 'jarvis'
                        message TEXT
                    )
                """)

                # Table for dynamic workflow profiles
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS workflows (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT UNIQUE,
                        steps TEXT, -- JSON layout of steps
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Table for hardware configurations keys/variables
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS preferences (
                        key TEXT PRIMARY KEY,
                        value TEXT,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                conn.commit()
                logger.info(f"Memory Engine SQLite schema booted at: {self.db_path}")
        except Exception as e:
            logger.error(f"SQL Initialize Error: {e}")

    def save_chat(self, sender: str, message: str):
        """Saves a message in the chat log."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO chat_log (sender, message) VALUES (?, ?)", (sender, message)
                )
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to record message in database: {e}")

    def get_chat_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns the recent interactive conversations history."""
        history = []
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT timestamp, sender, message FROM chat_log ORDER BY id DESC LIMIT ?", (limit,)
                )
                rows = cursor.fetchall()
                # Reverse to get chronological order back
                for row in reversed(rows):
                    history.append({
                        "timestamp": row[0],
                        "sender": row[1],
                        "message": row[2]
                    })
        except Exception as e:
            logger.error(f"Failed to recall messages: {e}")
        return history

    def log_automation_run(self, category: str, query: str, intent: str, command: str, result: str, status: str = "success") -> bool:
        """Records a plan action inside the long term system files memory ledger."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO action_memory (category, user_input, intent_parsed, recommended_action, execution_outcome, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (category, query, intent, command, result, status))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Memory action indexing failure: {e}")
            return False

    def query_automation_history(self, limit: int = 15) -> List[Tuple]:
        """Provides a flat tuple vector containing latest system actions logs."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT timestamp, category, user_input, intent_parsed, execution_outcome FROM action_memory ORDER BY id DESC LIMIT ?", (limit,))
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"Error querying task history: {e}")
            return []

    def set_preference(self, key: str, value: str):
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT OR REPLACE INTO preferences (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)", (key, value)
                )
                conn.commit()
        except Exception as e:
            logger.error(f"Failed updating preference '{key}': {e}")


if __name__ == "__main__":
    mem = MemoryEngine("./database/test_memory.db")
    mem.save_chat("user", "Hello Jarvis")
    mem.save_chat("jarvis", "Greetings operator. State your goal.")
    print("Chat:", mem.get_chat_history(5))
    mem.log_automation_run("SYSTEM", "Bootstrap System", "INITIALIZATION", "setup_tables", "Schema Ready", "success")
    print("History:", mem.query_automation_history(1))
