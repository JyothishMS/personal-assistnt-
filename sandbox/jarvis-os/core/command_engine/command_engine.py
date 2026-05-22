"""
JARVIS-OS Command Engine
Translates parsed intent targets into local safe system actions inside sandbox.
"""
import os
import shutil
import logging
from typing import Tuple, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CommandEngine")


class CommandEngine:
    """Executes safe actions strictly constrained within sandboxed environment borders."""

    def __init__(self, sandbox_root: str = "./sandbox"):
        self.sandbox_root = os.path.abspath(sandbox_root)
        os.makedirs(self.sandbox_root, exist_ok=True)
        logger.info(f"Command Engine online. Sandbox workspace anchor: {self.sandbox_root}")

    def execute_action(self, action_cmd: str, params: dict = None) -> Tuple[bool, str]:
        """Maps structured instructions to Python file-system actions."""
        try:
            tokens = action_cmd.strip().split()
            if not tokens:
                return False, "Command line parameter stream is empty"

            action_type = tokens[0].lower()

            if action_type == "create_file":
                filename = tokens[1] if len(tokens) > 1 else (params or {}).get("filename", "untitled.txt")
                # Grab content block starting after file token or params
                content = (params or {}).get("content", "")
                if not content and len(tokens) > 2:
                    content = " ".join(tokens[2:]).strip("'\"")
                
                target_path = self._get_safe_path(filename)
                
                # Make parent directories as well
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                with open(target_path, "w") as f:
                    f.write(content)
                logger.info(f"Sandbox write succeeded: {filename}")
                return True, f"Successfully created document: '{filename}' containing {len(content)} bytes."

            elif action_type == "delete_file":
                filename = tokens[1] if len(tokens) > 1 else (params or {}).get("filename")
                if not filename:
                    return False, "Parameter 'filename' missing from instructions stream."
                
                target_path = self._get_safe_path(filename)
                if not os.path.exists(target_path):
                    return False, f"File '{filename}' does not exist inside sandbox."

                if os.path.isdir(target_path):
                    shutil.rmtree(target_path)
                else:
                    os.remove(target_path)
                logger.info(f"Sandbox deletion succeeded: {filename}")
                return True, f"Permanently removed sandboxed resource: '{filename}'."

            elif action_type == "list_files":
                # List relative file layouts inside current sandboxed parameters
                entries = self._list_recursive(self.sandbox_root)
                if not entries:
                    return True, "Sandboxed workspace directory is currently empty."
                return True, "\n".join(entries)

            elif action_type == "organize_folder":
                folder_name = tokens[1] if len(tokens) > 1 else (params or {}).get("folder_name", "downloads")
                target_folder_path = self._get_safe_path(folder_name)
                
                # Dynamic simulations of clean downloads automation inside sandbox
                os.makedirs(target_folder_path, exist_ok=True)
                
                # Setup mock download cluttered documents to showcase sorting
                mock_files = {
                    "bill_final.pdf": "Documents/PDFs",
                    "install_package.dmg": "Installers",
                    "vacation_photo.png": "Media/Images",
                    "project_notes.docx": "Documents/Word",
                    "source_compiler.py": "Code/Python"
                }
                
                created = []
                for mock_name, sub_category in mock_files.items():
                    f_path = os.path.join(target_folder_path, mock_name)
                    if not os.path.exists(f_path):
                        with open(f_path, "w") as f:
                            f.write(f"Sample data content for {mock_name}")
                        created.append(mock_name)

                # Execute categorization sorting loop (Moving items in core system)
                sorted_log = []
                for item in os.listdir(target_folder_path):
                    item_path = os.path.join(target_folder_path, item)
                    if os.path.isfile(item_path):
                        ext = item.split(".")[-1].lower() if "." in item else ""
                        # Map folder targets
                        dest_sub = "Misc"
                        if ext in ["pdf", "doc", "docx", "txt"]:
                            dest_sub = "Documents"
                        elif ext in ["png", "jpg", "jpeg", "gif"]:
                            dest_sub = "Media"
                        elif ext in ["py", "js", "cpp", "java"]:
                            dest_sub = "Code"
                        elif ext in ["dmg", "pkg", "exe", "zip"]:
                            dest_sub = "Archives"

                        dest_dir = os.path.join(target_folder_path, dest_sub)
                        os.makedirs(dest_dir, exist_ok=True)
                        shutil.move(item_path, os.path.join(dest_dir, item))
                        sorted_log.append(f"Structured {item} -> {dest_sub}/")

                summary = f"Organized sandbox folder '{folder_name}'. Subdirectories cataloged:\n" + "\n".join(sorted_log) if sorted_log else f"Folder '{folder_name}' has already been optimized."
                return True, summary

            else:
                # Custom app launches mock simulator
                return True, f"Shell simulated trigger: Executed action '{action_cmd}' successfully inside sandboxed session."

        except Exception as e:
            logger.error(f"Error executing command: {e}")
            return False, f"EXECUTION REJECTED: {str(e)}"

    def _get_safe_path(self, relative_path: str) -> str:
        """Anchors path resolving to prevent sandbox traversal escapes."""
        resolved = os.path.abspath(os.path.join(self.sandbox_root, relative_path))
        if not resolved.startswith(self.sandbox_root):
            raise PermissionError("Path Traversal Escape Action Inhibited by Command Sandbox Environment.")
        return resolved

    def _list_recursive(self, dir_path: str) -> List[str]:
        relative_list = []
        for root, dirs, files in os.walk(dir_path):
            for file in files:
                full_path = os.path.join(root, file)
                rel = os.path.relpath(full_path, self.sandbox_root)
                relative_list.append(rel)
        return relative_list


if __name__ == "__main__":
    engine = CommandEngine("./test_sandbox")
    engine.execute_action("create_file notes.txt 'Remember to organize files tomorrow'")
    print(engine.execute_action("list_files"))
    print(engine.execute_action("organize_folder downloads"))
    # Cleanup test
    shutil.rmtree("./test_sandbox", ignore_errors=True)
