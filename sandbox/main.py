import os
import sys

def main():
    # Calculate local paths relative to this loader script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    jarvis_os_dir = os.path.join(current_dir, "jarvis-os")

    if os.path.isdir(jarvis_os_dir):
        # Align executing working directory to internal source folder
        os.chdir(jarvis_os_dir)
        sys.path.insert(0, jarvis_os_dir)
        
        # Import the true advanced boot kernel and execute
        from main import main as advanced_main
        advanced_main()
    else:
        print("[JARVIS-OS] Error: Core modular engine fold ('jarvis-os') is missing.")
        sys.exit(1)

if __name__ == "__main__":
    main()
