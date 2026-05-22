"""
JARVIS-OS Standard Initialization Bootstrap Kernel
Configures local paths, spawns daemon thread schedulers, and powers on command inputs.
"""
import os
import sys
import yaml
import argparse
import logging
from typing import Dict, Any

# Ensure we can resolve absolute import links relative to this root folder
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.runtime.jarvis_runtime import JarvisBackgroundDaemon
from interfaces.terminal.terminal_interface import JARVIS_TerminalInterface

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("JARVIS-Kernel")


def load_yaml_config(config_path: str) -> Dict[str, Any]:
    """Resolves local dynamic startup configuration metrics."""
    try:
        if os.path.exists(config_path):
            with open(config_path, "r") as f:
                return yaml.safe_load(f) or {}
    except Exception as e:
        logger.error(f"Config read error on file '{config_path}': {e}")
    return {}


def main():
    """Bootstrap root coordinator sequence."""
    parser = argparse.ArgumentParser(description="JARVIS-OS Local Sovereign System Core")
    parser.add_argument("--config", type=str, default="./config/config.yaml", help="Path to config.yaml")
    parser.add_argument("--command", type=str, help="Synchronously dispatch a specific instruction query")
    args = parser.parse_args()

    # Calculate config paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_resolved = os.path.join(script_dir, args.config)
    
    # Init settings map
    logger.info("Initializing sovereign machine profile context parameters...")
    config_data = load_yaml_config(config_resolved)

    # 1. Instantiate Core Daemon
    daemon = JarvisBackgroundDaemon(config_data)

    if args.command:
        # Running inside single transaction trigger mode
        logger.info(f"Direct Command Dispatch Mode: '{args.command}'")
        daemon.start_service()
        report = daemon.process_terminal_statement(args.command)
        print("\n--- Command Finished Output Summary ---")
        print(f"Status: {report.get('status').upper()}")
        print(f"Feedback: {report.get('summary_feedback')}")
        daemon.stop_service()
        sys.exit(0)
    else:
        # Running default continuous interactive terminal dashboard shell
        daemon.start_service()
        
        cli = JARVIS_TerminalInterface(daemon)
        cli.start_terminal_shell()
        
        # Shutdown cleanly
        daemon.stop_service()
        logger.info("Kernel teardown process finalized. Offline. Safeguards active.")


if __name__ == "__main__":
    main()
