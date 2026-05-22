"""
JARVIS-OS Intent Engine
Interprets high-level user statements and returns structured, validated intent schemas.
"""
import re
import json
import logging
import urllib.request
import urllib.error
import os
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IntentEngine")


class IntentEngine:
    """Classifies natural language statements into execution intent frames."""

    def __init__(self):
        logger.info("Semantic Intent Engine online. Neural and rule-based fallback systems active.")

    def parse_intent(self, text_query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Maps query to unified structured intent decision. Uses Gemini or smart rules."""
        query_strip = text_query.strip()
        logger.info(f"Analyzing semantic query: '{query_strip}'")

        # 1. Try Gemini Semantic Integration if API key is present
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                
                # Active Memory Integration: Build custom instruction prompt with context
                prompt = (
                    "You are the central brain of JARVIS-OS, a sovereign operating system core.\n"
                    "Analyze the user query and output a JSON matching the requested decision structure.\n"
                    f"User Query: \"{text_query}\"\n"
                    f"Context From Memory: {json.dumps(context or {})}\n\n"
                    "Your possible values for 'intent_type' are: ACTION | QUERY | AUTOMATION | FILE_OP | SYSTEM_OP | CONVERSE | FAILED_INTENT.\n"
                    "- Use FILE_OP for file/folder creation, deletion, list, search, or folder organization.\n"
                    "- Use SYSTEM_OP for running system processes, setting up environments, launching apps, etc.\n"
                    "- Use AUTOMATION for multi-step automated tasks or sequences.\n"
                    "- Use CONVERSE ONLY for pure social, chat, or informative statements with zero system action intent (e.g. 'hello', 'who are you', 'how does python work').\n"
                    "- Use FAILED_INTENT if the query clearly calls for system actions, folder setups, files, tools, or shell tasks, but is too ambiguous or corrupted to parse into concrete commands.\n\n"
                    "Output a valid JSON object matching this schema EXACTLY:\n"
                    "{\n"
                    '  "intent_type": "ACTION | QUERY | AUTOMATION | FILE_OP | SYSTEM_OP | CONVERSE | FAILED_INTENT",\n'
                    '  "steps": [\n'
                    "    {\n"
                    '      "id": "step_1",\n'
                    '      "statement": "Step description",\n'
                    '      "inferred_action": "ACTION | QUERY | AUTOMATION | FILE_OP | SYSTEM_OP | CONVERSE | FAILED_INTENT",\n'
                    '      "recommended_command": "command_string (use create_file filename, delete_file filename, list_files, organize_folder, open_app, or custom script execution)",\n'
                    '      "parameters": {}\n'
                    "    }\n"
                    "  ],\n"
                    '  "confidence": float (0.0 to 1.0),\n'
                    '  "requires_confirmation": boolean,\n'
                    '  "recommended_command": "primary step command string if single-step, else empty",\n'
                    '  "parameters": {},\n'
                    '  "target": "target identifier if any"\n'
                    "}\n"
                    "Return RAW JSON only. Do not wrap in markdown or block backticks."
                )
                
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json"
                    }
                }
                
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_raw = response.read().decode("utf-8")
                    res_data = json.loads(res_raw)
                    text_resp = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    parsed = json.loads(text_resp)
                    logger.info(f"Succeeded in parsing query via Gemini: {parsed.get('intent_type')}")
                    return parsed
            except Exception as e:
                logger.warning(f"Semantic parsing via Gemini failed/timed out: {e}. Reverting to Rule-Based Semantic Fallback.")

        # 2. Revert to robust rule-based semantic offline model
        return self._fallback_parse_intent(text_query, context)

    def _fallback_parse_intent(self, text_query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        query_strip = text_query.strip()
        query_low = query_strip.lower()

        # Detect pure social/chat messages first (CONVERSE)
        social_words = ["hello", "hi", "hey", "greetings", "how are you", "who are you", "what is your name", "thank you", "thanks", "good morning", "good afternoon"]
        is_pure_social = any(query_low.startswith(w) or query_low == w for w in social_words)
        
        # Verify if there is ANY action verb present
        action_verbs = [
            "create", "write", "make", "delete", "remove", "erase", "list", "show", "inspect", 
            "organize", "sort", "clean", "open", "launch", "run", "start", "set up", "setup", 
            "search", "find", "locate", "generate", "build", "wipe", "cat", "read", "update", "clear", "save", "scan", "execute"
        ]
        has_action_verb = any(v in query_low for v in action_verbs)

        # Verify if there is ANY system noun present (directories, configuration, file, db etc.)
        system_nouns = [
            "file", "folder", "directory", "project", "code", "script", "database", "db", 
            "sqlite", "security", "config", "json", "text", "command", "shell", "environment", "env", "sandbox"
        ]
        has_system_noun = any(n in query_low for n in system_nouns)

        # ACTIVE MEMORY PRECONTEXTUAL INFLUENCE:
        # If memory says there's a matching project folder or sandbox files, we adapt verbs
        matching_f = []
        if context and "matching_sandbox_files" in context:
            matching_f = context["matching_sandbox_files"]
        
        folders_list = []
        if context and "project_workspace_folders" in context:
            folders_list = context["project_workspace_folders"]

        # Only classify as CONVERSE if it's pure social or informative chat, with NO system verbs or system nouns
        if is_pure_social and not has_action_verb and not has_system_noun:
            return {
                "intent_type": "CONVERSE",
                "intent": "CONVERSE",
                "steps": [],
                "confidence": 0.95,
                "requires_confirmation": False,
                "recommended_command": "",
                "parameters": {"raw_query": query_strip},
                "target": ""
            }

        # If it has action verbs or system nouns, it's definitely an administrative or programmatic request
        # So we split and attempt exact parser mapping
        delimiters = [r"\s+and\s+then\s+", r"\s+then\s+", r"\s+and\s+", r";", r"\n"]
        combined_regex = "|".join(delimiters)
        segments = re.split(combined_regex, query_strip, flags=re.IGNORECASE)
        segments = [s.strip() for s in segments if s.strip()]

        steps = []
        requires_conf = False
        confidence_accum = []

        for idx, statement in enumerate(segments):
            step_id = f"step_{idx + 1}"
            low_statement = statement.lower()

            inferred = "ACTION"
            cmd = ""
            params = {}
            target = ""
            conf = 0.8
            
            # 1. FILE_CREATE or directory creation
            file_create_match = re.search(r"\b(create|write|make|generate)\s+file\s+([\w\.-]+)\s*(?:with|containing)?\s*['\"]?(.*?)['\"]?$", statement, re.IGNORECASE)
            folder_create_match = re.search(r"\b(create|write|make|generate)\s+(?:a\s+)?(?:project\s+)?folder\s+([\w\.-]+)", statement, re.IGNORECASE)
            
            if file_create_match:
                inferred = "FILE_OP"
                target_obj = file_create_match.group(2)
                content_payload = file_create_match.group(3) if file_create_match.group(3) else ""
                cmd = f"create_file {target_obj} '{content_payload}'"
                params = {"filename": target_obj, "content": content_payload}
                target = target_obj
                conf = 0.95
            elif folder_create_match:
                inferred = "FILE_OP"
                target_obj = folder_create_match.group(2)
                cmd = f"create_file {target_obj}/"
                params = {"filename": f"{target_obj}/", "content": ""}
                target = target_obj
                conf = 0.90
            elif "create" in low_statement and "folder" in low_statement:
                inferred = "FILE_OP"
                words = low_statement.split()
                try:
                    f_idx = words.index("folder")
                    target_obj = words[f_idx + 1].strip("/.")
                except Exception:
                    target_obj = "new_folder"
                cmd = f"create_file {target_obj}/"
                params = {"filename": f"{target_obj}/", "content": ""}
                target = target_obj
                conf = 0.85
                
            # 2. FILE_DELETE
            elif any(tok in low_statement for tok in ["delete", "remove", "erase", "wipe"]):
                inferred = "FILE_OP"
                match = re.search(r"\b(?:delete|remove|erase|wipe)\s+(?:file\s+)?([\w\.-]+)$", statement, re.IGNORECASE)
                if match:
                    target_obj = match.group(1)
                    cmd = f"delete_file {target_obj}"
                    params = {"filename": target_obj}
                    target = target_obj
                    conf = 0.95
                    requires_conf = True
                else:
                    conf = 0.4
                    
            # 3. LIST_FILES
            elif any(tok in low_statement for tok in ["list", "inspect", "show", "scan"]) and any(kw in low_statement for kw in ["file", "files", "workspace", "directory", "sandbox"]):
                inferred = "QUERY"
                cmd = "list_files"
                params = {}
                target = "sandbox_root"
                conf = 0.95
                
            # 4. ORGANIZE_FOLDER
            elif any(tok in low_statement for tok in ["organize", "sort", "clean"]):
                inferred = "AUTOMATION"
                match = re.search(r"\b(?:organize|sort|clean)\s+(?:my\s+)?([\w\.-]+)$", statement, re.IGNORECASE)
                target_folder = match.group(1) if match else "downloads"
                cmd = f"organize_folder {target_folder}"
                params = {"folder_name": target_folder}
                target = target_folder
                conf = 0.90
                
            # 5. OPEN_APP (influenced by Memory Preferences / Files Context!)
            elif any(tok in low_statement for tok in ["open", "launch", "run", "start"]):
                inferred = "SYSTEM_OP"
                app_name = "editor"
                
                # Active Memory Preference lookup:
                if "editor" in low_statement or "it" in low_statement:
                    if matching_f:
                        app_name = f"editor {matching_f[0]['relative_path']}"
                    else:
                        app_name = "editor"
                else:
                    match = re.search(r"\b(?:open|launch|run|start)\s+(?:it\s+in\s+)?([\w\.-]+)$", statement, re.IGNORECASE)
                    if match:
                        app_name = match.group(1)
                
                cmd = f"open_app {app_name}"
                params = {"app_name": app_name}
                target = app_name
                conf = 0.85
                
            # 6. SET UP ENVIRONMENT (e.g. Python env)
            elif "environment" in low_statement or "setup" in low_statement or "set up" in low_statement:
                inferred = "SYSTEM_OP"
                cmd = f"create_file env_setup_guide.txt 'Setup requirements for environment: {statement}'"
                params = {"filename": "env_setup_guide.txt", "content": f"Setup requirements for environment: {statement}"}
                target = "env_setup_guide.txt"
                conf = 0.85

            # If we couldn't resolve a concrete UNIX/SANDBOX action command in our rules,
            # and it has system-action nouns or verbs, mark it explicitly as FAILED_INTENT
            if not cmd:
                if has_action_verb or has_system_noun:
                    inferred = "FAILED_INTENT"
                    conf = 0.2
                    requires_conf = True
                else:
                    # Pure inform/chat fallback
                    inferred = "CONVERSE"
                    conf = 0.5
            
            steps.append({
                "id": step_id,
                "statement": statement,
                "inferred_action": inferred,
                "recommended_command": cmd,
                "parameters": params,
                "target": target,
                "confidence": conf
            })
            confidence_accum.append(conf)

        if not steps:
            return {
                "intent_type": "FAILED_INTENT",
                "intent": "FAILED_INTENT",
                "steps": [],
                "confidence": 0.0,
                "requires_confirmation": True,
                "recommended_command": "",
                "parameters": {},
                "target": ""
            }

        final_intent_type = "CONVERSE"
        non_converse_steps = [s for s in steps if s["inferred_action"] != "CONVERSE" and s["inferred_action"] != "FAILED_INTENT"]
        failed_steps = [s for s in steps if s["inferred_action"] == "FAILED_INTENT"]

        if failed_steps:
            final_intent_type = "FAILED_INTENT"
        elif non_converse_steps:
            types = [s["inferred_action"] for s in non_converse_steps]
            if "AUTOMATION" in types:
                final_intent_type = "AUTOMATION"
            elif "FILE_OP" in types:
                final_intent_type = "FILE_OP"
            elif "SYSTEM_OP" in types:
                final_intent_type = "SYSTEM_OP"
            else:
                final_intent_type = "ACTION"
        
        avg_confidence = sum(confidence_accum) / len(confidence_accum) if confidence_accum else 0.5

        primary_step = steps[0] if steps else {}
        return {
            "intent_type": final_intent_type,
            "intent": final_intent_type,
            "steps": steps,
            "confidence": avg_confidence,
            "requires_confirmation": requires_conf or final_intent_type == "FAILED_INTENT",
            "recommended_command": primary_step.get("recommended_command", ""),
            "parameters": primary_step.get("parameters", {}),
            "target": primary_step.get("target", "")
        }


if __name__ == "__main__":
    parser = IntentEngine()
    print("Parsed Action:", json.dumps(parser.parse_intent("Create a project folder"), indent=2))
    print("Parsed Invalid Action (Verb but no format):", json.dumps(parser.parse_intent("somehow do random things"), indent=2))
    print("Parsed Pure Social Conversation:", json.dumps(parser.parse_intent("hello jarvis how is your database running?"), indent=2))
