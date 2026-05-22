"""
JARVIS-OS Context Retriever
Parses and ranks SQLite conversation archives and filesystem configurations to build dynamic memory frames.
"""
import os
import json
import sqlite3
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ContextRetriever")


class ContextRetriever:
    """Interviews SQLite memories databases and scores matching artifacts for high-relevance recall."""

    def __init__(self, db_path: str = "./database/jarvis_memory.db", sandbox_root: str = "./sandbox"):
        self.db_path = db_path
        self.sandbox_root = os.path.abspath(sandbox_root)

    def _get_connection(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def retrieve_context_frame(self, user_query: str) -> Dict[str, Any]:
        """Collects historical database rows and matches filesystem documents, ranking them to build a comprehensive context frame."""
        logger.info(f"Retrieving contextual memory matrix for query: '{user_query}'")
        
        # 1. Fetch overall conversation histories from SQLite DB
        chats = self._fetch_recent_conversations()
        
        # 2. Fetch recent automation attempts
        actions = self._fetch_action_memory()
        
        # 3. Match relevant files in sandbox structure matching keywords
        files_matched = self._match_sandbox_files(user_query)

        # 4. Score and Rank Memories for relevance
        scored_chats = self._rank_chat_items(chats, user_query)
        scored_actions = self._rank_action_items(actions, user_query)

        # 5. Extract Workspace Project Metadata
        recent_folders = self._discover_project_folders()

        # Compile final unified framework response
        context_frame = {
            "query": user_query,
            "relevant_chats": scored_chats[:5],  # Top 5 relevant conversation logs
            "relevant_actions_history": scored_actions[:3],  # Top 3 relevant execution outcomes
            "matching_sandbox_files": files_matched[:5],
            "project_workspace_folders": recent_folders,
            "suggested_checkpoint_resumption": self._check_pending_checkpoints(user_query)
        }
        
        logger.info(f"Context retrieval complete. Recalled {len(scored_chats)} chats and {len(files_matched)} files.")
        return context_frame

    def _fetch_recent_conversations(self) -> List[Dict[str, Any]]:
        history = []
        if not os.path.exists(self.db_path):
            return history
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT sender, message, timestamp FROM chat_log ORDER BY id DESC LIMIT 100")
                for row in cursor.fetchall():
                    history.append({
                        "sender": row[0],
                        "message": row[1],
                        "timestamp": row[2]
                    })
        except Exception as e:
            logger.error(f"Cannot query conversations database: {e}")
        return history

    def _fetch_action_memory(self) -> List[Dict[str, Any]]:
        history = []
        if not os.path.exists(self.db_path):
            return history
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT category, user_input, intent_parsed, execution_outcome, status, timestamp FROM action_memory ORDER BY id DESC LIMIT 50")
                for row in cursor.fetchall():
                    history.append({
                        "category": row[0],
                        "query": row[1],
                        "intent": row[2],
                        "result": row[3],
                        "status": row[4],
                        "timestamp": row[5]
                    })
        except Exception as e:
            logger.error(f"Cannot query action telemetry database: {e}")
        return history

    def _rank_chat_items(self, chats: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        query_words = set(query.lower().split())
        for chat in chats:
            message_words = set(chat["message"].lower().split())
            intersection = query_words.intersection(message_words)
            # Basic overlap ranking formula
            chat["relevance_score"] = len(intersection)
        
        # Sort descending
        return sorted(chats, key=lambda x: x.get("relevance_score", 0), reverse=True)

    def _rank_action_items(self, actions: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        query_words = set(query.lower().split())
        for act in actions:
            combined_text = (act["query"] + " " + act["intent"] + " " + act["result"]).lower()
            text_words = set(combined_text.split())
            intersection = query_words.intersection(text_words)
            act["relevance_score"] = len(intersection)
            
        return sorted(actions, key=lambda x: x.get("relevance_score", 0), reverse=True)

    def _match_sandbox_files(self, query: str) -> List[Dict[str, Any]]:
        matched = []
        if not os.path.exists(self.sandbox_root):
            return matched

        query_words = query.lower().split()
        try:
            for root, dirs, files in os.walk(self.sandbox_root):
                for f in files:
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, self.sandbox_root)
                    
                    # Compute match overlap score against filepath tokens
                    f_lower = rel_p.lower()
                    overlap = sum(1 for w in query_words if w in f_lower)
                    
                    if overlap > 0 or any(kw in f_lower for kw in ["project", "code", "app", "todo"]):
                        matched.append({
                            "relative_path": rel_p,
                            "size_bytes": os.path.getsize(full_p),
                            "relevance_score": overlap + (1 if "source" in f_lower or "app" in f_lower else 0)
                        })
        except Exception as e:
            logger.error(f"Sandbox file scanning interrupted: {e}")
            
        return sorted(matched, key=lambda x: x.get("relevance_score", 0), reverse=True)

    def _discover_project_folders(self) -> List[str]:
        folders = []
        if not os.path.exists(self.sandbox_root):
            return folders
        try:
            for item in os.listdir(self.sandbox_root):
                if os.path.isdir(os.path.join(self.sandbox_root, item)):
                    folders.append(item)
        except Exception:
            pass
        return folders

    def _check_pending_checkpoints(self, query: str) -> Dict[str, Any]:
        """Inspects saved JSON task checkpoints to determine if an uncompleted goal matches search keywords."""
        checkpoints_dir = "./database/checkpoints"
        if not os.path.exists(checkpoints_dir):
            return {}

        query_words = set(query.lower().split())
        try:
            for file_name in os.listdir(checkpoints_dir):
                if file_name.endswith(".json"):
                    full_p = os.path.join(checkpoints_dir, file_name)
                    with open(full_p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if data.get("status") in ["active", "suspended"]:
                            goal = data.get("raw_goal", "").lower()
                            overlap = len(query_words.intersection(set(goal.split())))
                            if overlap > 0 or "continue" in query.lower() or "resume" in query.lower():
                                return {
                                    "pipeline_id": data.get("pipeline_id"),
                                    "original_goal": data.get("raw_goal"),
                                    "status": data.get("status"),
                                    "steps_completed": sum(1 for s in data.get("steps", []) if s.get("status") == "success"),
                                    "total_steps": len(data.get("steps", []))
                                }
        except Exception as e:
            logger.warning(f"Failed checkpoint examination: {e}")
        return {}


if __name__ == "__main__":
    retriever = ContextRetriever("./database/test_retrieve.db", "./test_sandbox")
    os.makedirs("./test_sandbox/my_neural_ai", exist_ok=True)
    with open("./test_sandbox/my_neural_ai/todo.txt", "w") as f:
        f.write("Integrate Context Memory Retrieval Module.")
        
    res = retriever.retrieve_context_frame("Let us continue my neural ai app")
    import json
    print(json.dumps(res, indent=2))
    import shutil
    shutil.rmtree("./test_sandbox", ignore_errors=True)
