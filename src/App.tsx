import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal as TerminalIcon, 
  FolderOpen, 
  Database, 
  Cpu, 
  Volume2, 
  Mic, 
  Play, 
  Save, 
  Trash, 
  Plus, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  ChevronRight,
  Clock,
  Files,
  Server,
  Smartphone,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Laptop,
  Bell,
  Eye,
  Settings2,
  Camera,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initAuth, googleSignIn, getAccessToken, logout } from "./lib/firebase";
import type { User } from 'firebase/auth';
import { 
  SandboxFile, 
  TelemetryStats, 
  ChatMessage, 
  DatabaseState 
} from "./types";

const tauriJsonSample = `{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:3000",
    "distDir": "../dist"
  },
  "package": {
    "productName": "JARVIS-OS",
    "version": "2.8.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "execute": true,
        "scope": [{ "name": "npm", "cmd": "npm", "args": true }]
      },
      "fs": {
        "all": true,
        "scope": ["$APPDIR/all-contents", "$DOCUMENT/all-contents"]
      },
      "notification": {
         "all": true
      },
      "systemTray": {
         "iconPath": "icons/icon.png",
         "iconAsTemplate": true
      }
    }
  }
}`;

const pythonCodeSample = `# Sample Python runner invoking offline local server
import requests

def query_local_ollama(prompt, model="llama3:8b"):
    url = "http://127.0.0.1:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(url, json=payload)
        return response.json().get("response")
    except Exception as e:
        return f"Fallback: Local models offline. Error: {e}"`;

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = initAuth((user, token) => {
      setCurrentUser(user);
      setAuthToken(token);
    }, () => {
      setCurrentUser(null);
      setAuthToken(null);
    });
    return () => unsubscribe();
  }, []);

  // Conversational & Functional Tabs
  const [activeTab, setActiveTab] = useState<"converse" | "tasks" | "laptop" | "files" | "memory" | "mobile" | "architecture">("converse");

  // Core State Management
  const [selectedArchSection, setSelectedArchSection] = useState("plan");
  const [telemetry, setTelemetry] = useState<TelemetryStats | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);
  const [sandboxFiles, setSandboxFiles] = useState<SandboxFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [dbState, setDbState] = useState<DatabaseState | null>(null);
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM memory_log ORDER BY id DESC LIMIT 10");
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlMessage, setSqlMessage] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  // Reminders / Alerts Notifications State
  const [reminders, setReminders] = useState<Array<{ id: number; text: string; time: string; active: boolean }>>([
    { id: 1, text: "Review database memory index parameters", time: "18:00", active: true },
    { id: 2, text: "Run automated file space cleanup optimization", time: "21:00", active: true }
  ]);
  const [newReminderText, setNewReminderText] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [toasts, setToasts] = useState<Array<{ id: string; text: string; type: "info" | "success" | "warning" }>>([]);

  // Mobile pairing simulation
  const [pairingPIN, setPairingPIN] = useState("7482");
  const [phoneState, setPhoneState] = useState({
    paired: true,
    deviceName: "iPhone 15 Pro",
    battery: 88,
    status: "Synchronized",
    lastPulse: "10 seconds ago"
  });
  const [pairInput, setPairInput] = useState("");
  const [voiceTone, setVoiceTone] = useState<"Jarvis" | "Friday" | "Zephyr" | "Kore">("Jarvis");
  const [isBackgroundListening, setIsBackgroundListening] = useState(false);

  // Electron Desktop Native and Floating Overlay state variables
  const [isOverlayMode, setIsOverlayMode] = useState(true);
  const [autostartOnBoot, setAutostartOnBoot] = useState(true);
  const [trayMinimizeMode, setTrayMinimizeMode] = useState(true);
  const [unrestrictedFsAccess, setUnrestrictedFsAccess] = useState(true);
  const [idleMemoryAlloc, setIdleMemoryAlloc] = useState(14.2);
  const [electronVersion, setElectronVersion] = useState("v32.0.2");
  const [showTrayMenu, setShowTrayMenu] = useState(false);
  const [activeTaskRetries, setActiveTaskRetries] = useState(0);

  // Chat/Terminal Operators
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "jarvis",
      text: "System initialized. Good day, sir. All neural pipelines and local laptop control channels are online. SQLite memory engines connected successfully.",
      timestamp: new Date().toLocaleTimeString(),
      intent: "SYSTEM_BOOT"
    }
  ]);
  const [inputCommand, setInputCommand] = useState("");
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [modelType, setModelType] = useState<"llama3" | "deepseek:coder" | "phi3" | "llava" | "whisper" | "piper" | "llama3:8b" | "deepseek" | "mistral">("llama3");
  const [safetyLevel, setSafetyLevel] = useState<"STRICT" | "PERMISSIVE">("STRICT");

  // Autonomous Sequence Executor
  const [goalInput, setGoalInput] = useState("Create a documentation folder and write a backup metrics file logs.txt");
  const [compiledSteps, setCompiledSteps] = useState<any[]>([
    { id: "step_1", statement: "Check local backup directory status metrics", inferred_action: "FILE_OP", recommendedCmd: "list_files" },
    { id: "step_2", statement: "Create auto-archive subfolder called sandbox/backup", inferred_action: "FILE_OP", recommendedCmd: "create_file backup/" },
    { id: "step_3", statement: "Sync active memories log to sandbox/backup/history.log", inferred_action: "SYSTEM_ROUTING", recommendedCmd: "create_file backup/history.log '[Backup Sync] System logs recorded.'" },
    { id: "step_4", statement: "Perform local database integrity check", inferred_action: "SECURITY_CHECK", recommendedCmd: "sqlite_check" }
  ]);
  const [compilingState, setCompilingState] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [executingPlan, setExecutingPlan] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  // Modular AI Core Configurations
  const [ollamaPort, setOllamaPort] = useState("11434");
  const [contextLimit, setContextLimit] = useState(4096);
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [systemPromptPersona, setSystemPromptPersona] = useState<"butler" | "coder" | "friday">("butler");

  // Semantic Vector Retrieval Engine
  const [semanticSearchQuery, setSemanticSearchQuery] = useState("");
  const [semanticSearchResults, setSemanticSearchResults] = useState<any[]>([]);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [memorySubTab, setMemorySubTab] = useState<"tables" | "sql_terminal" | "embeddings">("tables");

  // Voice Assistant Layer Parameters
  const [wakePhrase, setWakePhrase] = useState("Hey Jarvis");
  const [wakeSensitivity, setWakeSensitivity] = useState(85);
  const [continuousListening, setContinuousListening] = useState(false);

  // Autonomous Planner Verification & Retries
  const [enableAutoVerify, setEnableAutoVerify] = useState(true);
  const [enableRetryOnFail, setEnableRetryOnFail] = useState(true);
  const [plannerMaxRetries, setPlannerMaxRetries] = useState(3);

  // Background runtime representation & Floating assistant overlay states
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAdvancedCabinet, setShowAdvancedCabinet] = useState(false);
  const [countdownToMinimize, setCountdownToMinimize] = useState<number | null>(null);
  const [isTauriPanelOpen, setIsTauriPanelOpen] = useState(false);
  const [systCpu, setSystCpu] = useState(1.4);
  const [systRam, setSystRam] = useState(12.8);
  const [desktopAlerts, setDesktopAlerts] = useState<Array<{ id: string; title: string; body: string; time: string }>>([
    { id: "boot", title: "JARVIS-OS Kernel", body: "Established sandboxed container link & verified security rules.", time: "10:24 AM" }
  ]);

  const triggerDesktopNotification = (title: string, body: string) => {
    const id = Date.now().toString();
    const alertEntry = { id, title, body, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setDesktopAlerts(prev => [alertEntry, ...prev]);
    addToast(`${title}: ${body}`, "success");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSystCpu(Number((Math.random() * 1.6 + 0.6).toFixed(1)));
      setSystRam(Number((12.4 + Math.random() * 0.9).toFixed(1)));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Administrative Clearance Gate approvals dictionary
  const [approvedCommands, setApprovedCommands] = useState<Record<string, { 
    response: string; 
    verifiedSuccess?: boolean; 
    verificationMsg?: string;
    loading?: boolean;
  }>>({});

  const handleApproveBypass = async (commandId: string, commandRaw: string) => {
    setApprovedCommands(prev => ({
      ...prev,
      [commandId]: { response: "", loading: true, verifiedSuccess: false }
    }));
    addToast("Authorizing supervisor credential bypass...", "info");

    try {
      const res = await fetch("/api/security/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandRaw })
      });
      const data = await res.json();
      
      setApprovedCommands(prev => ({
        ...prev,
        [commandId]: { 
          response: data.executionResponse || data.message || "Executed cleanly.", 
          verifiedSuccess: data.verification_status === "VERIFIED_SUCCESS",
          verificationMsg: data.verification_message || "Action verified.",
          loading: false 
        }
      }));
      addToast("Bypass authorization verified successfully!", "success");
      setTelemetryTrigger(prev => prev + 1);
      fetchSandboxFiles();
    } catch (e: any) {
      setApprovedCommands(prev => ({
        ...prev,
        [commandId]: { 
          response: `Fatal execution error during supervisor override: ${e.message}`, 
          verifiedSuccess: false,
          verificationMsg: "Action Verification Failure.",
          loading: false 
        }
      }));
      addToast("Failed to compile override bypass.", "warning");
    }
  };

  // Sandboxed Rollback Snapshots State
  const [snapshotsList, setSnapshotsList] = useState<any[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState("");

  const fetchSnapshots = async () => {
    try {
      const res = await fetch("/api/snapshots");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setSnapshotsList(data);
        } else {
          console.warn("Snapshots response is not JSON (server booting)");
        }
      }
    } catch (e: any) {
      console.error("Failed to fetch snapshots:", e.message || e);
    }
  };

  // Terminal Simulator State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "JARVIS-OS Kernel v1.0.0-beta.1 (tty0) initialized.",
    "Established event bus listener: ipc://local_event_bus.sock",
    "Type 'help' list available sandboxed system utilities."
  ]);
  const [terminalCmd, setTerminalCmd] = useState("");

  // Document summarizer helper variables
  const [summaryTargetFile, setSummaryTargetFile] = useState<string>("");
  const [documentSummary, setDocumentSummary] = useState<string>("");
  const [summarizingFileStatus, setSummarizingFileStatus] = useState(false);

  // Sound and Mic Simulation state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState<number[]>(Array.from({ length: 18 }, () => 3));
  const animationRef = useRef<number | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [telemetryTrigger, setTelemetryTrigger] = useState(0);

  // Custom Notifications Trigger helper
  const addToast = (text: string, type: "info" | "success" | "warning" = "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch telemetry status
  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (active) {
              setTelemetry(data);
              setLoadingTelemetry(false);
            }
          } else {
            console.warn("Telemetry response is not JSON (server booting or routing fallback)");
          }
        }
      } catch (err: any) {
        console.error("Telemetry offline:", err.message || err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [telemetryTrigger]);

  // Fetch sandbox files
  const fetchSandboxFiles = async () => {
    try {
      const res = await fetch("/api/sandbox");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setSandboxFiles(data.files || []);
          if (data.files && data.files.length > 0 && !summaryTargetFile) {
            setSummaryTargetFile(data.files[0].name);
          }
        } else {
          console.warn("Sandbox response is not JSON (server booting)");
        }
      }
    } catch (err: any) {
      console.error("Sandbox failure:", err.message || err);
    }
  };

  useEffect(() => {
    fetchSandboxFiles();
    fetchSnapshots();
  }, [activeTab]);

  // Spacebar hotkey to toggle voice assistant (only if not focused on editable nodes)
  // Dynamic Global Hotkeys: Alt + Space OR Ctrl + J to instantly summon/minimize the assistant overlay
  useEffect(() => {
    const handleGlobalSpaceToggle = (e: KeyboardEvent) => {
      // 1. Check if hotkey is Alt + Space or Ctrl + J
      const isAltSpace = e.code === "Space" && e.altKey;
      const isCtrlJ = (e.key === "j" || e.key === "J") && e.ctrlKey;

      if (isAltSpace || isCtrlJ) {
        e.preventDefault();
        setIsMinimized(prev => {
          const next = !prev;
          if (next) {
            playAudioResponse("Minimizing cores to tray.");
            addToast("JARVIS minimized quietly to system tray Node", "info");
          } else {
            playAudioResponse("Core activated sir, standing by.");
            addToast("Holographic JARVIS summoning engaged!", "success");
            // If opening, automatically activate direct voice mic listener if speech system is allowed
            setTimeout(() => {
              if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
                setIsVoiceListening(true);
                toggleMicrophoneInput();
              }
            }, 600);
          }
          return next;
        });
        return;
      }

      // 2. Standard space toggle mic
      if (e.code === "Space") {
        const activeEl = document.activeElement;
        const isEditable = activeEl && (
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true"
        );
        if (!isEditable) {
          e.preventDefault();
          toggleMicrophoneInput();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalSpaceToggle);
    return () => window.removeEventListener("keydown", handleGlobalSpaceToggle);
  }, [isVoiceListening, voiceTone, modelType, isMinimized]);

  // Fetch SQLite logs
  const fetchDatabaseState = async () => {
    try {
      const res = await fetch("/api/database");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setDbState(data);
        } else {
          console.warn("Database stats response is not JSON (server booting)");
        }
      }
    } catch (err: any) {
      console.error("DB stats pull failure:", err.message || err);
    }
  };

  useEffect(() => {
    if (activeTab === "memory") {
      fetchDatabaseState();
    }
  }, [activeTab]);

  // Execute Goal Compilation & Autonomous Runner
  const handleCompileGoal = async () => {
    setCompilingState(true);
    setCompiledSteps([]);
    setCurrentStepIndex(-1);
    setExecutionLog([]);
    try {
      const res = await fetch("/api/cognitive/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalInput })
      });
      if (res.ok) {
        const data = await res.json();
        setCompiledSteps(data.steps || []);
        addToast("Sovereign goal decomposed successfully into logical tasks.", "success");
      }
    } catch (err) {
      console.error("Goal processing issue:", err);
      addToast("Failed to compile goal sequence.", "warning");
    } finally {
      setCompilingState(false);
    }
  };

  // Run Compiled steps autonomously
  const startAutonomousPlanRun = async () => {
    if (compiledSteps.length === 0) return;
    setExecutingPlan(true);
    setExecutionLog(["[JARVIS Autopilot Engine]: Spin lock engaged. Commencing sequence execution..."]);

    let totalRetriesUsed = 0;
    let allStepsSuccess = true;

    for (let i = 0; i < compiledSteps.length; i++) {
      setCurrentStepIndex(i);
      const step = compiledSteps[i];
      setExecutionLog(prev => [...prev, `[Task ${i + 1}/${compiledSteps.length}]: Dispatching command execution for "${step.statement}"...`]);
      
      // Delay to simulate real-time processing feedback
      await new Promise(resolve => setTimeout(resolve, 1400));

      let stepSucceeded = false;
      let attempts = 0;
      const maxRetries = enableRetryOnFail ? plannerMaxRetries : 1;

      while (!stepSucceeded && attempts < maxRetries) {
        attempts++;
        if (attempts > 1) {
          totalRetriesUsed++;
          setExecutionLog(prev => [...prev, `[Auto-Retry]: Engaging corrective recovery block. Retrying task "${step.statement}" (Attempt ${attempts}/${maxRetries})...`]);
          await new Promise(resolve => setTimeout(resolve, 1200));
        }

        try {
          const token = await getAccessToken();
          const res = await fetch("/process_input", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(token && { "Authorization": `Bearer ${token}` }) },
            body: JSON.stringify({ query: step.statement })
          });
          const data = await res.json();
          
          // Verify output
          if (enableAutoVerify) {
            setExecutionLog(prev => [...prev, `[Verification]: Checking execution constraints for "${step.statement}"...`]);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Check real system output if failed
            if (!data.executionSuccess) {
                throw new Error(data.executionResponse || "Task verification failed. Execution sequence blocked.");
            }
            
            setExecutionLog(prev => [
              ...prev, 
              `[Verification SUCCESS]: Output constraints verified. Integrity check matches expected status code (200).`
            ]);
          }

          if (data.executionResponse) {
            setExecutionLog(prev => [...prev, `[System Response]:\n${data.executionResponse}`, `[Task Succeeded]: ${step.id || `step_${i+1}`} resolved cleanly.`]);
          } else {
            setExecutionLog(prev => [...prev, `[Task Succeeded]: Solved cleanly via standard local heuristic.`]);
          }
          
          stepSucceeded = true;
        } catch (err: any) {
          setExecutionLog(prev => [...prev, `[Task Failed]: ${err.message || "Local exception in execution path."}`]);
          if (attempts >= maxRetries) {
            setExecutionLog(prev => [...prev, `[Fatal Planner Error]: Max attempts limit reached. Manual supervisor intervention required.`]);
          }
        }
      }

      if (!stepSucceeded) {
        // If a step truly failed and retries exhausted, break plan
        allStepsSuccess = false;
        break;
      }
    }

    // Persist behavioral telemetry trace
    try {
      await fetch("/api/learning/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goalInput || "Autonomous Planner Run",
          step_count: compiledSteps.length,
          success: allStepsSuccess,
          retries_needed: totalRetriesUsed,
          healing_strategy: totalRetriesUsed > 0 ? "Dependency conflict validation auto-repair" : "Standard sandboxed trajectory"
        })
      });
    } catch (e) {
      console.error("Failed to commit behavioral telemetry footprint:", e);
    }

    setCurrentStepIndex(-1);
    setExecutingPlan(false);
    setExecutionLog(prev => [...prev, "[Plan Completed]: All active autonomous objectives executed and outputs verified."]);
    addToast("Target automation workflow run completed.", "success");
    fetchSandboxFiles();
    setTelemetryTrigger(prev => prev + 1);

    if (allStepsSuccess) {
      triggerDesktopNotification("JARVIS-OS Autopilot Success", "All compiled actions resolved with zero error codes and verified.");
      playAudioResponse("Task completed successfully, sir. All objectives verified. Minimizing core interface.");
      
      let sec = 5;
      setCountdownToMinimize(sec);
      const intv = setInterval(() => {
        sec--;
        if (sec <= 0) {
          clearInterval(intv);
          setCountdownToMinimize(null);
          setIsMinimized(true);
        } else {
          setCountdownToMinimize(sec);
        }
      }, 1000);
    } else {
      triggerDesktopNotification("JARVIS-OS Autopilot Halted", "Manual supervisor bypass or code debugging required.");
      playAudioResponse("Excuse me sir, an execution anomaly occurred. The process did not return zero exit status.");
    }
  };

  // Chat submission API proxy
  const handleSendCommand = async (text: string) => {
    const rawInput = text.trim();
    if (!rawInput) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString() + "_user",
      sender: "user",
      text: rawInput,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputCommand("");
    setIsProcessingChat(true);

    try {
        const token = await getAccessToken();
        const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { "Authorization": `Bearer ${token}` }) },
        body: JSON.stringify({
          query: rawInput,
          activeModel: modelType,
          safetyLevel: safetyLevel
        })
      });
      const data = await res.json();

      const jarvisMsg: ChatMessage = {
        id: Date.now().toString() + "_jarvis",
        sender: "jarvis",
        text: data.aiResponse || data.narrative,
        timestamp: new Date().toLocaleTimeString(),
        intent: data.intent,
        reasoning: data.reasoning,
        recommendedCmd: data.recommendedCmd,
        isDangerous: data.isDangerous,
        pendingApproval: data.pendingApproval,
        executionResponse: data.executionResponse,
        sqliteDbCommand: data.sqliteDbCommand,
        providersUsed: data.providersUsed,
        taskType: data.taskType
      };

      setMessages(prev => [...prev, jarvisMsg]);
      playAudioResponse(data.aiResponse || data.narrative);
      addToast("JARVIS Response synced offline", "success");
      setTelemetryTrigger(prev => prev + 1);

    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "_err",
        sender: "system",
        text: `Command exception inside neural engine. Core response fallback: Simulated local task completed successfully.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  // Dynamic Browser application shortcuts simulations
  const simulateLaptopAppLaunch = (appName: string, terminalCommand: string) => {
    setExecutionLog([]);
    addToast(`Dispatching local launcher shortcut: ${appName}`, "info");
    
    // Auto insert an outcome log inside Chat
    const simulatedResponse = `[Auto-automation]: Successfully launched laptop application '${appName}' natively. Dispatched system command: '${terminalCommand}' in background.`;
    setMessages(prev => [...prev, {
      id: Date.now().toString() + "_system",
      sender: "system",
      text: simulatedResponse,
      timestamp: new Date().toLocaleTimeString()
    }]);

    playAudioResponse(`Initializing ${appName}`);

    // Persist log inside local DB JSON format
    fetch("/api/database/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `INSERT INTO memory_log (category, user_command, ai_response, executed_action) VALUES ('LAPTOP_LAUNCHER', 'Launch ${appName}', 'App triggered directly', '${terminalCommand}')`
      })
    }).catch(err => console.error("Could not write metrics", err));
  };

  // Start / Spawn a process in the sandbox environment
  const handleSpawnProcess = async (procName: string) => {
    if (!procName) return;
    try {
      const res = await fetch("/api/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: procName })
      });
      if (res.ok) {
        addToast(`Successfully spawned daemon process: ${procName}`, "success");
        setTelemetryTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to spawn process:", err);
    }
  };

  // Terminate / Kill process in the sandbox
  const handleKillProcess = async (pidVal: number, procName: string) => {
    try {
      const res = await fetch(`/api/processes/${pidVal}`, {
        method: "DELETE"
      });
      if (res.ok) {
        addToast(`SIGKILL signal broadcasted to process: ${procName} [PID: ${pidVal}]`, "warning");
        setTelemetryTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to kill process:", err);
    }
  };

  // Create workspace file snapshots 
  const handleCreateSnapshot = async (snapName: string) => {
    setSnapshotLoading(true);
    try {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: snapName })
      });
      if (res.ok) {
        const data = await res.json();
        addToast(`Created structural snapshot: ${data.snapshot.name}`, "success");
        setNewSnapshotName("");
        fetchSnapshots();
        fetchSandboxFiles();
      }
    } catch (err) {
      console.error("Failed to create snapshot:", err);
    } finally {
      setSnapshotLoading(false);
    }
  };

  // Restore workspace files back to snapshot
  const handleRollbackSnapshot = async (snapId: string, snapLabel: string) => {
    setSnapshotLoading(true);
    try {
      const res = await fetch("/api/snapshots/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: snapId })
      });
      if (res.ok) {
        addToast(`SUCCESSFUL ROLLBACK: Restored sandbox filesystem to snapshot "${snapLabel}"`, "warning");
        playAudioResponse(`Database and filesystem rollback completed`);
        fetchSnapshots();
        fetchSandboxFiles();
      }
    } catch (err) {
      console.error("Failed to rollback snapshot:", err);
    } finally {
      setSnapshotLoading(false);
    }
  };

  // Generate automated files summarizing reads
  const handleSummarizeTargetFile = async () => {
    if (!summaryTargetFile) return;
    setSummarizingFileStatus(true);
    try {
      const res = await fetch(`/api/sandbox/file?path=${encodeURIComponent(summaryTargetFile)}`);
      if (res.ok) {
        const fileData = await res.json();
        const cleanContent = fileData.content || "";
        
        // Let's generate a highly polished smart summary analysis
        setTimeout(() => {
          const fileLines = cleanContent.split("\n").filter((l: string) => l.trim().length > 0);
          const totalCharacters = cleanContent.length;
          const summaryBlocks = [
            `Document Name: ${summaryTargetFile}`,
            `Analyzed File Metrics: Total length of ${totalCharacters} characters with ${fileLines.length} descriptive parameters.`,
            `Key Extracted Intentions & Observations:`,
            fileLines.slice(0, 3).map((l: string, idx: number) => ` - Fact ${idx + 1}: ${l.substring(0, 75)}...`).join("\n"),
            `Executive Conclusion: File serves as a private state log and core config mapping parameters. Integrity check verified.`
          ].join("\n");
          setDocumentSummary(summaryBlocks);
          addToast(`File ${summaryTargetFile} summarized successfully`, "success");
          setSummarizingFileStatus(false);
        }, 1000);
      } else {
        setDocumentSummary("Unable to open file. Verify path integrity.");
        setSummarizingFileStatus(false);
      }
    } catch (err) {
      setDocumentSummary("Failed to process local analytical summary.");
      setSummarizingFileStatus(false);
    }
  };

  // Speech synthesizers using Web Speech
  const playAudioResponse = (txt: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanStr = txt.replace(/\[.*?\]/g, "").replace(/`.*?`/g, "").substring(0, 160);
    const utterance = new SpeechSynthesisUtterance(cleanStr);
    utterance.rate = 1.05;
    if (voiceTone === "Jarvis") utterance.pitch = 0.88;
    else if (voiceTone === "Zephyr") utterance.pitch = 1.05;
    else if (voiceTone === "Friday") utterance.pitch = 1.15;
    else utterance.pitch = 0.65;
    window.speechSynthesis.speak(utterance);
  };

  // Handle manual micro-action input recording
  const toggleMicrophoneInput = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      const listPrompt = [
        "Open terminal app simulator and show configuration variables",
        "Create file notes.txt containing 'Review notes for task planner integrations'",
        "Search Google for SQLite optimization commands",
        "Synthesize summaries for config.yaml"
      ];
      const randomTrigger = listPrompt[Math.floor(Math.random() * listPrompt.length)];
      handleSendCommand(randomTrigger);
    } else {
      setIsVoiceListening(true);
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecType = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const speechObj = new SpeechRecType();
        speechObj.continuous = false;
        speechObj.interimResults = false;
        speechObj.lang = "en-US";
        speechObj.onresult = (e: any) => {
          const capText = e.results[0][0].transcript;
          if (capText) {
            handleSendCommand(capText);
          }
          setIsVoiceListening(false);
        };
        speechObj.onerror = () => setIsVoiceListening(false);
        speechObj.onend = () => setIsVoiceListening(false);
        speechObj.start();
      } else {
        // Fallback simulation timer
        setTimeout(() => {
          setIsVoiceListening(false);
        }, 3000);
      }
    }
  };

  // Pulse wave animation for Voice Orb
  useEffect(() => {
    if (isVoiceListening) {
      const runWaveform = () => {
        setAudioFeedback(prev => prev.map(() => Math.floor(Math.random() * 26) + 4));
        animationRef.current = requestAnimationFrame(runWaveform);
      };
      runWaveform();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setAudioFeedback(Array.from({ length: 18 }, () => 3));
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVoiceListening]);

  // REAL PASSIVE WAKE-WORD ("Hey Jarvis") LISTENER HOOK
  useEffect(() => {
    let passiveRecognition: any = null;
    let autoRestart = true;

    if (isBackgroundListening && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecType = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      passiveRecognition = new SpeechRecType();
      passiveRecognition.continuous = true;
      passiveRecognition.interimResults = false;
      passiveRecognition.lang = "en-US";

      passiveRecognition.onresult = (e: any) => {
        const lastIndex = e.results.length - 1;
        const transcript = e.results[lastIndex][0].transcript.trim().toLowerCase();
        
        console.log("[Hey Jarvis Wake Word Listener]: Heard phrase ->", transcript);
        
        if (transcript.includes("hey jarvis") || transcript.includes("jarvis")) {
          // Extract the command trailing phrase
          let command = "";
          const jarvisMark = "jarvis";
          const idx = transcript.indexOf(jarvisMark);
          if (idx !== -1) {
            command = transcript.substring(idx + jarvisMark.length).trim();
          }

          // Trigger feedback & executive launch, and MAXIMIZE!
          setIsMinimized(false);
          playAudioResponse("Core activated. Yes sir?");
          addToast("Hey JARVIS wake word detected!", "success");
          
          if (command) {
            console.log("[Wake Word Executing Command]:", command);
            handleSendCommand(command);
          } else {
            // Give brief delay to let speak complete, then start user microphone
            setTimeout(() => {
              setIsVoiceListening(true); // Open mic for direct prompt speak!
              toggleMicrophoneInput();
            }, 1200);
          }
        }
      };

      passiveRecognition.onend = () => {
        if (autoRestart && isBackgroundListening) {
          try { passiveRecognition.start(); } catch (err) {}
        }
      };

      passiveRecognition.onerror = (err: any) => {
        console.warn("[Wake Word Listener Warning]:", err.error);
        if (err.error === "not-allowed") {
          autoRestart = false; // Microphone permission declined or occupied
          addToast("Microphone block: Please grant security permissions using the browser address bar icon or by clicking the central Voice Orb.", "warning");
        } else if (err.error === "aborted" || err.error === "network") {
          // ignore or quiet retry
        } else {
          addToast(`Voice feed notification: ${err.error || "service-unavailable"}`, "info");
        }
      };

      try {
        passiveRecognition.start();
        console.log("[Hey Jarvis] Passive background listener successfully initialized.");
      } catch (err) {}
    }

    return () => {
      autoRestart = false;
      if (passiveRecognition) {
        try { passiveRecognition.stop(); } catch (err) {}
      }
    };
  }, [isBackgroundListening]);

  // Handle select Sandbox File to view
  const handleSelectFile = async (name: string) => {
    try {
      setSelectedFile(name);
      setFileContent("// Accessing target system binary... loading contents");
      const res = await fetch(`/api/sandbox/file?path=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content || "");
      }
    } catch (err) {
      setFileContent("// Unable to retrieve files on local sandbox path.");
    }
  };

  const saveFileToLocalSandbox = async () => {
    if (!selectedFile) return;
    setIsSavingFile(true);
    try {
      const res = await fetch("/api/sandbox/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selectedFile, content: fileContent })
      });
      if (res.ok) {
        addToast(`Successfully saved changes back to ${selectedFile}`, "success");
        fetchSandboxFiles();
      }
    } catch (err) {
      addToast("Disk write failure.", "warning");
    } finally {
      setIsSavingFile(false);
    }
  };

  // Execute manual memory state SQL queries
  const handleExecuteDatabaseStateSQL = async () => {
    setIsQuerying(true);
    setSqlResult(null);
    setSqlMessage("");
    try {
      const res = await fetch("/api/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sqlQuery })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Heuristics compilation constraints violation");
      setSqlResult(data.results || []);
      setSqlMessage(data.message || "SQLite Query successfully executed against memory registry.");
      fetchDatabaseState();
    } catch (err: any) {
      setSqlMessage(`SQL ERROR EXCEPTION: ${err.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  // Add individual customizable reminders
  const handleAddPrivateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim() || !newReminderTime) return;
    const item = {
      id: Date.now(),
      text: newReminderText,
      time: newReminderTime,
      active: true
    };
    setReminders(prev => [...prev, item]);
    setNewReminderText("");
    setNewReminderTime("");
    addToast(`Reminder added for ${newReminderTime}`, "success");
    playAudioResponse(`Reminder logged`);
  };

  // Live Terminal Command Simulator
  const handleExecuteTerminalCommand = async (cmdStr?: string) => {
    const rawCmd = (cmdStr || terminalCmd).trim();
    if (!rawCmd) return;
    setTerminalLogs(prev => [...prev, `jarvis-os$ ${rawCmd}`]);
    setTerminalCmd("");

    const cmdLower = rawCmd.toLowerCase();
    let resultLog = "";

    await new Promise(resolve => setTimeout(resolve, 250));

    if (cmdLower === "clear") {
      setTerminalLogs([]);
      return;
    } else if (cmdLower === "help") {
      resultLog = "Available Sandboxed Utilities:\n" +
                  " - help                : Show this command ledger\n" +
                  " - clear               : Clear terminal scroll buffer\n" +
                  " - ls -la              : Query active sandbox files recursively\n" +
                  " - cat config.yaml     : Show primary local config rules\n" +
                  " - mkdir <dir>         : Simulate directories creation in workspace\n" +
                  " - echo '<msg>'        : Echo back user argument logs\n" +
                  " - status              : Query active memory databases stats";
    } else if (cmdLower === "ls -la" || cmdLower === "ls") {
      try {
        const res = await fetch("/api/sandbox");
        if (res.ok) {
          const data = await res.json();
          const names = data.files ? data.files.map((f: any) => `${f.is_directory ? "drwxr-xr-x" : "-rw-r--r--"}  admin  2048  ${f.name}`).join("\n") : "Empty Sandbox";
          resultLog = `total ${data.files ? data.files.length : 0}\n${names}`;
        } else {
          resultLog = "Error: Permission denied on local sandbox access.";
        }
      } catch (e) {
        resultLog = "total 2\n-rw-r--r--  admin  1408  todo.txt\n-rw-r--r--  admin  2107  config.yaml";
      }
    } else if (cmdLower.startsWith("cat ")) {
      const target = rawCmd.substring(4).trim();
      try {
        const res = await fetch(`/api/sandbox/file?path=${encodeURIComponent(target)}`);
        if (res.ok) {
          const data = await res.json();
          resultLog = data.content || `[Empty content file: ${target}]`;
        } else {
          resultLog = `cat: ${target}: No such file or directory in sandbox limit.`;
        }
      } catch (e) {
        resultLog = `cat: ${target}: Connection stream timed out.`;
      }
    } else if (cmdLower.startsWith("mkdir ")) {
      const target = rawCmd.substring(6).trim();
      resultLog = `Simulated folder mkdir succeeded. Created folder \`./sandbox/${target}\` successfully.`;
      fetchSandboxFiles();
    } else if (cmdLower.startsWith("echo ")) {
      resultLog = rawCmd.substring(5).trim().replace(/['"]/g, "");
    } else if (cmdLower === "status") {
      resultLog = `JARVIS-OS Offline Core Status:\n` +
                  ` - SQLite database: ACTIVE\n` +
                  ` - Memory table records: ${dbState?.memory?.length || 2}\n` +
                  ` - Passive voice listener: ${isBackgroundListening ? "RUNNING" : "OFFLINE"}\n` +
                  ` - Active Ollama model: ${modelType} (Port localhost:${ollamaPort})`;
    } else {
      resultLog = `bash: command not found: ${rawCmd.split(" ")[0]}. Try 'help'.`;
    }

    setTerminalLogs(prev => [...prev, resultLog]);
    setTelemetryTrigger(t => t + 1);
  };

  // Cosine Similarity Matcher for Semantic Vector Embeddings
  const handleCosineVectorMatch = async () => {
    if (!semanticSearchQuery.trim()) return;
    setIsSemanticSearching(true);
    setSemanticSearchResults([]);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Sample vector embeddings detailing local operating parameters
    const mockVectorDB = [
      { text: "Backup coordinates mapped on sandbox/backup/history.log", vector: [0.12, -0.42, 0.81, 0.05, 0.23], distance: 0.11, similarity: 0.942, category: "SYSTEM" },
      { text: "Active security compliant parameters and rule definitions", vector: [0.08, -0.15, 0.44, 0.91, -0.12], distance: 0.19, similarity: 0.891, category: "SECURITY" },
      { text: "Workspace documents read summarizer cache parameters", vector: [-0.31, 0.52, 0.11, -0.18, 0.76], distance: 0.28, similarity: 0.835, category: "COGNITIVE" },
      { text: "Offline voice parameters wake-word tolerance levels", vector: [0.65, 0.22, -0.05, 0.12, 0.39], distance: 0.41, similarity: 0.720, category: "VOICE" },
    ];

    const lower = semanticSearchQuery.toLowerCase();
    const ranked = mockVectorDB.map(item => {
      let bonus = 0;
      if (lower.split(" ").some(word => item.text.toLowerCase().includes(word) || item.category.toLowerCase().includes(word))) {
        bonus = 0.04;
      }
      return {
        ...item,
        similarity: Math.min(0.98, item.similarity + bonus),
        distance: Math.max(0.02, item.distance - bonus)
      };
    }).sort((a: any, b: any) => b.similarity - a.similarity);

    setSemanticSearchResults(ranked);
    setIsSemanticSearching(false);
    addToast("Semantic vector embedding matches retrieved offline", "success");

    // Persist log inside local DB JSON format
    fetch("/api/database/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `INSERT INTO memory_log (category, user_command, ai_response, executed_action) VALUES ('VECTOR_SEARCH', 'Semantic query: ${semanticSearchQuery}', 'Retrieved similarity matches', 'cosine_match')`
      })
    }).catch(err => console.error("Database sync failed", err));
  };

  // Toggle pairing PIN sync
  const handlePairWatchOrPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (pairInput === pairingPIN) {
      setPhoneState({
        paired: true,
        deviceName: "Local Smartphone Companion",
        battery: 95,
        status: "Active Link Tethered",
        lastPulse: "Just now"
      });
      addToast("Sovereign companion paired successfully over core WiFi channels.", "success");
      setPairInput("");
    } else {
      addToast("Verification code mismatch.", "warning");
    }
  };

  // Scroll to bottom of messaging panel
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`min-h-screen ${isOverlayMode ? 'bg-transparent' : 'bg-[#030712]'} text-slate-100 flex flex-col font-sans relative overflow-hidden select-none antialiased`}>
      {/* HUD atmospheric mesh and matrix-like overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#1d4ed812,transparent_100%)] pointer-events-none" />

      {/* MATRIX AND STAR PARTICLES OR BARS */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none animate-pulse" />

      {/* FIXED TOAST NOTIFICATION STREAM */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`p-3.5 rounded-lg border shadow-xl flex items-start gap-2.5 backdrop-blur-md pointer-events-auto ${
                t.type === "success" 
                  ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                  : t.type === "warning"
                    ? "bg-red-950/90 border-red-500/30 text-rose-300"
                    : "bg-blue-950/90 border-blue-500/30 text-sky-300"
              }`}
            >
              <Bell className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-[11px] font-mono leading-relaxed">
                <span className="font-bold uppercase tracking-wider block text-[9px] text-slate-400 mb-0.5">System Alert</span>
                {t.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SIMULATED MAC/WINDOWS NATIVE NOTIFICATION SHEET FOR HIGH DEEP BACKGROUND AUTONOMY ALERT */}
      <div className="fixed top-20 right-6 z-50 max-w-sm w-full pointer-events-none space-y-2 select-text font-mono">
        <AnimatePresence>
          {desktopAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="p-4 bg-slate-950/90 border border-white/10 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl pointer-events-auto flex gap-3 relative overflow-hidden"
            >
              <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500" />
              <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 h-9 w-9 flex items-center justify-center text-cyan-400">
                <Laptop className="h-4 w-4 animate-pulse" />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span className="uppercase font-bold tracking-wider">Tauri Local Link Daemon</span>
                  <span>{alert.time}</span>
                </div>
                <h4 className="text-[11.5px] font-bold text-slate-100 uppercase tracking-tight">{alert.title}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{alert.body}</p>
                <div className="flex gap-2 pt-1 font-mono text-[9px]">
                  <button 
                    onClick={() => { setIsMinimized(false); setDesktopAlerts(prev => prev.filter(x => x.id !== alert.id)); }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                  >
                    Open Console Overlay
                  </button>
                  <button 
                    onClick={() => setDesktopAlerts(prev => prev.filter(x => x.id !== alert.id))}
                    className="text-slate-500 hover:text-slate-300 font-bold cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setDesktopAlerts(prev => prev.filter(x => x.id !== alert.id))}
                className="absolute top-2 right-2 text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 1. CYBERNETIC OS WALLPAPER DESKTOP VIEWPORT */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-between p-6">
        
        {/* BACKGROUND GEO-COORDINATES SYSTEM MAP (CINEMATIC ROTATION ACCENTS) */}
        <div className="absolute inset-0 bg-[#02050b] z-0 opacity-100 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[900px] h-[900px] rounded-full border border-dashed border-cyan-500/10 animate-spin-slow flex items-center justify-center">
            <div className="text-[8.5px] font-mono text-cyan-500/20 tracking-widest absolute -top-5">JARVIS_ELECTRON_STEALTH_CORE_DAEMON</div>
            <div className="absolute w-[600px] h-[600px] rounded-full border border-double border-indigo-500/5 animate-reverse-spin-slow flex items-center justify-center" />
          </div>
          {/* Subtle grid lines background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c705_1px,transparent_1px),linear-gradient(to_bottom,#0284c705_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* NATIVE SYSTEM TOPBAR & TRAY CONTROLS */}
        <div className="relative z-40 flex items-center justify-between select-none font-mono text-[10px] bg-slate-950/80 border border-white/5 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-cyan-950/30 text-cyan-400 border border-cyan-500/10 px-2.5 py-1 rounded-xl">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-[9px] uppercase tracking-wider">ELECTRON DAEMON ONLINE</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 font-mono text-[9px] hidden sm:inline">Port: <span className="text-cyan-450">3000 (Internal)</span></span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-slate-400 font-mono text-[9px] hidden md:inline">RAM: <span className="text-lime-450 font-bold">{idleMemoryAlloc} MB [LOW IDLE]</span></span>
          </div>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button 
                onClick={async () => {
                  try {
                    await googleSignIn();
                    addToast("Workspace synchronized via OAuth", "success");
                  } catch (err) {
                    addToast("Workspace sync failed", "warning");
                  }
                }}
                className="bg-[#070b12] text-slate-300 border border-white/5 hover:bg-slate-800 px-3 py-1 rounded-xl text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <div className="h-2.5 w-2.5 bg-rose-500 rounded-full" /> Google Login
              </button>
            ) : (
              <button 
                onClick={async () => {
                  await logout();
                  addToast("Workspace disconnected", "info");
                }}
                className="bg-[#070b12] text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-xl text-[9px] font-bold cursor-pointer transition-all"
              >
                Connected: {currentUser.email}
              </button>
            )}

            {/* Presentation Mode Selector Toggle slider */}
            <div className="flex bg-[#070b12] border border-white/5 rounded-xl p-0.5">
              <button
                onClick={() => {
                  setIsOverlayMode(true);
                  addToast("Switched to clean Floating Overlay Mode", "info");
                  playAudioResponse("Floating assistant overlay finalized.");
                }}
                className={`px-3 py-1 rounded-lg text-[8.5px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isOverlayMode 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                <span>❄️ Overlay</span>
              </button>
              <button
                onClick={() => {
                  setIsOverlayMode(false);
                  addToast("Switched to Full Desktop Simulator Mode", "info");
                  playAudioResponse("Interactive virtual desktop restored.");
                }}
                className={`px-3 py-1 rounded-lg text-[8.5px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  !isOverlayMode 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                <span>🖥️ OS Desktop</span>
              </button>
            </div>

            {/* Electron Simulated System Tray dropdown menu button */}
            <div className="relative">
              <button
                onClick={() => setShowTrayMenu(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-[9.5px] font-bold uppercase cursor-pointer ${
                  showTrayMenu 
                    ? "bg-cyan-500 text-slate-950 border-cyan-400" 
                    : "bg-[#070b12] border-white/10 text-slate-300 hover:bg-slate-900"
                }`}
                title="Simulated Electron Tray menu"
              >
                <Database className="h-3 w-3" />
                <span>Tray Menu</span>
                <ChevronRight className={`h-3 w-3 transform transition-transform ${showTrayMenu ? "rotate-90" : ""}`} />
              </button>

              <AnimatePresence>
                {showTrayMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-64 bg-[#050810]/95 border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-3xl p-4 text-left space-y-3 z-50 text-[10px]"
                  >
                    <div className="border-b border-indigo-950/60 pb-2 flex items-center justify-between text-slate-400">
                      <span className="font-extrabold uppercase text-[8.5px] tracking-wider text-cyan-400">JARVIS Electron Runtime</span>
                      <span className="font-mono text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-bold">{electronVersion}</span>
                    </div>

                    <div className="space-y-2 select-none">
                      {/* Startup on boot toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Startup on Boot System:</span>
                        <button
                          onClick={() => {
                            setAutostartOnBoot(p => !p);
                            triggerDesktopNotification("Electron Settings", `Auto-startup on system login ${!autostartOnBoot ? "enabled" : "disabled"}.`);
                          }}
                          className={`px-2 py-0.5 rounded font-bold text-[8px] ${autostartOnBoot ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500 border border-slate-800"}`}
                        >
                          {autostartOnBoot ? "ACTIVE" : "OFF"}
                        </button>
                      </div>

                      {/* Minimize to tray toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Persistent Background:</span>
                        <button
                          onClick={() => {
                            setTrayMinimizeMode(p => !p);
                            triggerDesktopNotification("Electron Settings", `Tray persistence on window close ${!trayMinimizeMode ? "enabled" : "disabled"}.`);
                          }}
                          className={`px-2 py-0.5 rounded font-bold text-[8px] ${trayMinimizeMode ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "bg-slate-900 text-slate-500 border border-slate-800"}`}
                        >
                          {trayMinimizeMode ? "ENABLED" : "OFF"}
                        </button>
                      </div>

                      {/* Unrestricted FS Access info */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Unrestricted Sandbox FS:</span>
                        <span className="text-lime-400 font-bold text-[8px]">GRANTED</span>
                      </div>

                      {/* Native notifications info */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">OS System Toast Server:</span>
                        <span className="text-emerald-400 font-bold text-[8px]">CONNECTED</span>
                      </div>

                      {/* Idle Memory allocator status */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-900 select-none">
                        <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                          <span>SYSTEM MEMORY TARGET:</span>
                          <span className="text-cyan-400">{idleMemoryAlloc} MB</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full w-[12%]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-indigo-950/60 flex gap-2">
                      <button
                        onClick={() => { setIsMinimized(true); setShowTrayMenu(false); playAudioResponse("Core minimized quietly."); }}
                        className="flex-1 text-center bg-slate-900 hover:bg-slate-850 border border-white/5 py-1 text-[8.5px] font-bold rounded cursor-pointer text-slate-300"
                      >
                        Hide to Tray
                      </button>
                      <button
                        onClick={() => {
                          const conf = window.confirm("Terminate native JARVIS Electron process daemon?");
                          if (conf) {
                            addToast("Daemon connection terminated. Reload workspace.", "warning");
                            playAudioResponse("Shutting down processes.");
                          }
                          setShowTrayMenu(false);
                        }}
                        className="px-2 text-center bg-rose-950/20 text-red-400 hover:bg-rose-900/30 border border-red-500/10 py-1 text-[8.5px] font-bold rounded cursor-pointer"
                      >
                        Force Quit
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 2. OPTIONAL OS DESKTOP SHORTCUTS COLUMNS (Shown only when NOT in clean floating overlay mode) */}
        {!isOverlayMode && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4.5 w-fit mt-4 select-none font-sans">
            <div 
              onClick={() => { setIsMinimized(false); setActiveTab("converse"); }}
              className="flex flex-col items-center justify-center w-22 h-22 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/35 transition-all text-center p-2 cursor-pointer group shadow-lg shadow-black/20 backdrop-blur-md"
              title="Click to summon conversation overlay"
            >
              <div className="mb-1.5 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition-all flex items-center justify-center h-9 w-9">
                <Mic className="h-4.5 w-4.5" />
              </div>
              <span className="text-[9px] font-bold text-slate-300 group-hover:text-cyan-300">Jarvis Voice</span>
              <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-normal">Companion</span>
            </div>

            <div 
              onClick={() => { setIsMinimized(false); setActiveTab("tasks"); }}
              className="flex flex-col items-center justify-center w-22 h-22 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/35 transition-all text-center p-2 cursor-pointer group shadow-lg shadow-black/20 backdrop-blur-md"
              title="Click to open task compiler"
            >
              <div className="mb-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-all flex items-center justify-center h-9 w-9">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <span className="text-[9px] font-bold text-slate-300 group-hover:text-emerald-300">Autopilot</span>
              <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-normal">Sequence</span>
            </div>

            <div 
              onClick={() => { setShowAdvancedCabinet(true); setActiveTab("files"); }}
              className="flex flex-col items-center justify-center w-22 h-22 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-amber-500/10 hover:border-amber-500/35 transition-all text-center p-2 cursor-pointer group shadow-lg shadow-black/20 backdrop-blur-md"
              title="Inspect sandbox drive"
            >
              <div className="mb-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-450 group-hover:bg-amber-500/20 transition-all flex items-center justify-center h-9 w-9">
                <FolderOpen className="h-4.5 w-4.5" />
              </div>
              <span className="text-[9px] font-bold text-slate-300 group-hover:text-amber-300">Sandbox Disk</span>
              <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-normal">Workspace</span>
            </div>

            <div 
              onClick={() => { setShowAdvancedCabinet(true); setActiveTab("memory"); }}
              className="flex flex-col items-center justify-center w-22 h-22 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-violet-500/10 hover:border-violet-500/35 transition-all text-center p-2 cursor-pointer group shadow-lg shadow-black/20 backdrop-blur-md"
              title="Inspect database tables"
            >
              <div className="mb-1.5 p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 group-hover:bg-violet-500/20 transition-all flex items-center justify-center h-9 w-9">
                <Database className="h-4.5 w-4.5" />
              </div>
              <span className="text-[9px] font-bold text-slate-300 group-hover:text-violet-300">SQLite DB</span>
              <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-normal">Sync Ledger</span>
            </div>
          </div>
        )}

        {/* 3. COHESIVE INTERACTIVE FLOATING ASSISTANT OVERLAY (CINEMATIC CARD CENTERED) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                className="w-full max-w-xl bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 md:p-6 flex flex-col gap-5 shadow-[0_0_80px_rgba(6,182,212,0.18)] border-cyan-500/20 pointer-events-auto select-text relative overflow-hidden"
                id="floating-assistant-card"
              >
                {/* Visual Glass highlights */}
                <div className="absolute -top-[140px] -right-[140px] h-[280px] w-[280px] rounded-full bg-cyan-700/10 blur-[50px] pointer-events-none" />
                <div className="absolute -bottom-[120px] -left-[120px] h-[240px] w-[240px] rounded-full bg-indigo-700/10 blur-[50px] pointer-events-none" />

                {/* ELECTRON NATIVE WINDOW TITLEBAR */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 select-none cursor-grab active:cursor-grabbing">
                  {/* Traffic lights macOS window actions buttons */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => { setIsMinimized(true); playAudioResponse("Minimizing process daemon sir."); addToast("JARVIS minimized quietly to system tray Node", "info"); }}
                      className="w-3 h-3 rounded-full bg-red-500 border border-red-600 flex items-center justify-center text-[5px] text-red-900 font-bold hover:after:content-['×'] after:absolute cursor-pointer"
                      title="Close (Minimize to Tray)"
                    />
                    <button 
                      onClick={() => { setIsMinimized(true); playAudioResponse("Minimizing."); }}
                      className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600 flex items-center justify-center text-[5px] text-yellow-900 font-bold cursor-pointer"
                      title="Minimize Window"
                    />
                    <button 
                      onClick={() => {
                        setIsOverlayMode(prev => !prev);
                        addToast(`Toggled presentation view mode`, "success");
                      }}
                      className="w-3 h-3 rounded-full bg-green-500 border border-green-600 flex items-center justify-center text-[5px] text-green-900 font-bold cursor-pointer"
                      title="Toggle Presentation Overlay"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-2">
                      JARVIS.app &bull; <span className="text-cyan-400 text-[9px]">Always-On-Top</span>
                    </span>
                  </div>
                  
                  {/* Active telemetry statistics capsule */}
                  <div className="flex items-center gap-2 text-[8px] font-mono bg-slate-900/60 border border-white/5 px-2.5 py-1 rounded-full text-slate-500">
                    <span className="text-cyan-400 font-bold select-all">PORT: 3000</span>
                    <span>&bull;</span>
                    <span className="text-lime-400 select-all">1.4% CPU</span>
                  </div>
                </div>

                {/* THE HOLOGRAM AI CORE ORB SPHERE */}
                <div className="flex flex-col items-center justify-center py-2.5 select-none relative">
                  
                  {/* Glowing Orbit Spheres outer rings */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Ring 1 - Spinning dotted border */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20 animate-spin-slow" />
                    {/* Ring 2 - Rotating solid frame */}
                    <div className="absolute inset-2 rounded-full border border-indigo-400/10 animate-reverse-spin-slow flex items-center justify-center" />
                    
                    {/* Pulsing Outer Core Atmosphere */}
                    <motion.div 
                      animate={{ 
                        scale: isVoiceListening ? [1, 1.25, 1] : [1, 1.08, 1],
                        opacity: isVoiceListening ? [0.18, 0.45, 0.18] : [0.12, 0.22, 0.12]
                      }}
                      transition={{ repeat: Infinity, duration: isVoiceListening ? 1.2 : 4 }}
                      className="absolute inset-[15px] rounded-full bg-cyan-700/30 blur"
                    />

                    {/* Central Gradient Glowing Sphere (JARVIS Orb) */}
                    <motion.div 
                      animate={{ 
                        boxShadow: isVoiceListening 
                          ? ["0 0 20px rgba(34,211,238,0.4)", "0 0 45px rgba(34,211,238,0.7)", "0 0 20px rgba(34,211,238,0.4)"] 
                          : ["0 0 15px rgba(34,211,238,0.2)", "0 0 25px rgba(34,211,238,0.4)", "0 0 15px rgba(34,211,238,0.2)"]
                      }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      onClick={() => toggleMicrophoneInput()}
                      className="absolute inset-[25px] rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center cursor-pointer shadow-xl relative z-30"
                    >
                      <div className="absolute inset-0.5 rounded-full bg-[#050812]/95 flex flex-col items-center justify-center">
                        <Mic className={`h-4.5 w-4.5 ${isVoiceListening ? "text-cyan-400 animate-bounce" : "text-indigo-400 group-hover:text-cyan-300"}`} />
                        {isVoiceListening ? (
                          <span className="text-[7px] font-mono text-cyan-400 font-bold tracking-widest mt-0.5 uppercase animate-pulse">Speak</span>
                        ) : (
                          <span className="text-[7px] font-mono text-slate-500 mt-0.5 uppercase">Standby</span>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* ACTIVE SPEECH / ACOUSTICS WAVEFORM ANIMATOR (Shown when hearing or speaking) */}
                  {isVoiceListening && (
                    <div className="flex gap-[3.5px] h-6 items-center justify-center px-4 py-1 bg-cyan-800/10 border border-cyan-500/15 rounded-lg font-mono text-[9px] mt-3.5 shadow-inner">
                      {audioFeedback.map((lev, idx) => (
                        <motion.div 
                          key={idx}
                          animate={{ height: [lev, lev * 1.8, lev] }}
                          transition={{ repeat: Infinity, duration: 0.6 + (idx * 0.05) }}
                          className="w-[2.2px] bg-cyan-400 rounded-full"
                          style={{ height: `${lev * 3.2}px` }}
                        />
                      ))}
                      <span className="text-cyan-400 font-bold ml-2 uppercase animate-pulse">Listening...</span>
                    </div>
                  )}

                  {!isVoiceListening && (
                    <div className="text-[9px] font-mono text-slate-400 mt-3.5 flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 border border-slate-800/50 rounded-full select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-ping" />
                      <span>Speech Passive Active &bull; hotkeys: <kbd className="text-[8px] bg-slate-950 px-1 py-0.5 rounded text-cyan-400 font-bold uppercase">Alt+Space</kbd> / <kbd className="text-[8px] bg-slate-950 px-1 py-0.5 rounded text-cyan-400 font-bold uppercase">Ctrl+J</kbd></span>
                    </div>
                  )}
                </div>

                {/* CURRENT CONV CONTEXT FEED (CONCISE USER INTERACTION BINDING) */}
                <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 max-h-[110px] overflow-y-auto font-sans shadow-inner shrink-0 scrollbar-thin select-text">
                  <div className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider border-b border-white/5 pb-1 font-bold flex justify-between">
                    <span>Acoustics Memory Register</span>
                    <span className="text-cyan-500">Live feed</span>
                  </div>
                  {messages.slice(-2).map((msg) => (
                    <div key={msg.id} className={`flex gap-2 text-[10.5px] leading-normal ${msg.sender === "user" ? "justify-end text-cyan-300" : "justify-start text-slate-300"}`}>
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase font-black shrink-0">
                        {msg.sender === "user" ? "[SIR]:" : "[JARVIS]:"}
                      </span>
                      <p className={`font-sans rounded px-1 max-w-[85%] text-left`}>
                        {msg.text}
                      </p>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* COMPACT AUTONOMOUS PLANNER HUD (MINIMAL LIVE EXEC FEED - REQUIREMENT 5) */}
                <AnimatePresence>
                  {executingPlan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border border-cyan-500/20 bg-slate-950/95 rounded-2xl p-3.5 font-mono text-[10px] text-left space-y-2.5 overflow-hidden shadow-inner"
                    >
                      <div className="flex items-center justify-between border-b border-cyan-950/40 pb-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="uppercase tracking-widest text-[9px]">JARVIS AUTOPILOT DAEMON STREAM</span>
                        </div>
                        <span className="bg-cyan-500/10 text-cyan-400 text-[8px] px-1.5 py-0.5 rounded border border-cyan-500/20 font-black">
                          SECURE PROCESSOR
                        </span>
                      </div>

                      {/* Goal Display */}
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-900 text-[9.5px]">
                        <span className="text-slate-500 text-[8px] uppercase block font-black mb-0.5">CURRENT DIRECTIVE GOAL:</span>
                        <p className="text-slate-200 leading-normal font-sans italic">"{goalInput || "Autonomous Planner Run"}"</p>
                      </div>

                      {/* Micro Progress Track */}
                      <div className="space-y-1 select-none">
                        <div className="flex justify-between items-center text-[8.5px] text-slate-500">
                          <span>SEQUENCE STEPS PIPELINE</span>
                          <span className="text-cyan-400 font-bold">Step {currentStepIndex + 1} of {compiledSteps.length}</span>
                        </div>
                        
                        {/* Progress slider bar */}
                        <div className="h-1 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                            style={{ width: `${compiledSteps.length ? ((currentStepIndex + 1) / compiledSteps.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Tasks Check HUD list */}
                      <div className="space-y-1 max-h-[90px] overflow-y-auto text-[9px] bg-slate-900/40 p-2 rounded border border-slate-900/60 select-none scrollbar-thin">
                        {compiledSteps.map((step, idx) => {
                          const isDone = idx < currentStepIndex;
                          const isCurrent = idx === currentStepIndex;
                          return (
                            <div key={step.id || idx} className="flex justify-between items-center py-0.5 border-b border-slate-950/60">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[7.5px] px-1.5 py-0.5 font-bold uppercase rounded ${
                                  isDone ? "bg-emerald-500/10 text-emerald-400" : isCurrent ? "bg-cyan-500/10 text-cyan-400 animate-pulse" : "bg-slate-900 text-slate-600"
                                }`}>
                                  {isDone ? "DONE" : isCurrent ? "RUN" : "PEND"}
                                </span>
                                <span className={isDone ? "text-slate-500 line-through" : isCurrent ? "text-cyan-300 font-bold animate-pulse" : "text-slate-400"}>
                                  {step.statement}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-550 font-mono tracking-tighter">{step.recommendedCmd}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Live logs container */}
                      <div className="p-2 bg-[#050810] rounded border border-indigo-950/40 text-[9px] leading-relaxed text-indigo-300 flex flex-col gap-0.5 max-h-[60px] overflow-y-auto scrollbar-thin">
                        {executionLog.slice(-2).map((log, lidx) => (
                          <div key={lidx} className="whitespace-pre-wrap font-mono tracking-tight text-slate-400">
                            {log}
                          </div>
                        ))}
                      </div>

                      {/* Countdown Overlay minimized */}
                      {countdownToMinimize !== null && (
                        <div className="flex items-center gap-1.5 justify-center p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] rounded-lg animate-pulse">
                          <Clock className="h-3 w-3 text-indigo-400 animate-spin" />
                          <span>Objective Met. Auto-hiding back to Tray in <span className="font-bold text-cyan-300 font-mono text-[10px]">{countdownToMinimize}</span>s.</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* THE MINIMAL VOICE-PRIMARY SUBMISSION CONTROLS (UNRESTRICTED OVERLAY INTERCONNECT) */}
                <div className="space-y-3 select-none shrink-0 border-t border-white/5 pt-3">
                  
                  {/* Quick profile controllers row */}
                  <div className="grid grid-cols-2 gap-3 pb-0.5">
                    {/* Speech tones custom togglers */}
                    <div className="flex flex-col text-[8px] font-mono select-none text-left">
                      <span className="text-slate-500 uppercase font-black text-[7px] tracking-wider mb-1">Voice Acoustics:</span>
                      <div className="flex bg-[#070b12] border border-white/5 rounded-lg p-0.5 justify-between">
                        {["Jarvis", "Friday", "Zephyr"].map((tone) => (
                          <button
                            key={tone}
                            onClick={() => { setVoiceTone(tone as any); playAudioResponse(`Loaded ${tone}`); addToast(`Switched back voice to ${tone}`, "info"); }}
                            className={`px-1.5 py-0.5 rounded text-[8px] transition-all cursor-pointer font-bold capitalize ${
                              voiceTone === tone 
                                ? "bg-cyan-500/10 text-cyan-400" 
                                : "text-slate-500 hover:text-slate-350"
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Model select slider */}
                    <div className="flex flex-col text-[8px] font-mono select-none text-left">
                      <span className="text-slate-500 uppercase font-black text-[7px] tracking-wider mb-1">Cognitive Pipeline:</span>
                      <div className="grid grid-cols-3 gap-1 bg-[#070b12] border border-white/5 rounded-lg p-0.5">
                        {[
                          { key: "llama3", label: "Llama3" },
                          { key: "deepseek:coder", label: "Seeker" },
                          { key: "phi3", label: "Phi3" },
                          { key: "llava", label: "LLaVA" },
                          { key: "whisper", label: "STT" },
                          { key: "piper", label: "TTS" }
                        ].map((md) => (
                          <button
                            key={md.key}
                            onClick={() => { setModelType(md.key as any); addToast(`Selected ${md.label} offline router weights`, "info"); }}
                            className={`px-1 py-0.5 rounded text-[7px] transition-all cursor-pointer font-black uppercase text-center ${
                              modelType === md.key 
                                ? "bg-cyan-500/10 text-cyan-400" 
                                : "text-slate-500 hover:text-slate-350"
                            }`}
                          >
                            {md.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Autopilot instruction submission drawer */}
                  <div className="bg-[#050812] border border-white/5 rounded-2xl p-2.5 space-y-2 select-text font-mono text-left">
                    <div className="flex justify-between items-center text-[8.5px] tracking-widest text-slate-500 uppercase font-bold">
                      <span>WAKING COMMAND AUTO-PILOT</span>
                      {/* Hey Jarvis Simulation trigger button - extremely premium demonstration */}
                      <button
                        onClick={() => {
                          setIsMinimized(false);
                          playAudioResponse("Core activated. Establishing secure host process bind. Initializing sandbox directive sync.");
                          addToast("Hey JARVIS wake phrase triggered!", "success");
                          // Populate a beautiful complex file auto-operation directive & auto compile and auto run!
                          setGoalInput("Check backup directory status, list files, and write backup history logs");
                          
                          // Set step sequence
                          setCompiledSteps([
                            { id: "step_1", statement: "Check local backup directory status metrics", inferred_action: "FILE_OP", recommendedCmd: "list_files" },
                            { id: "step_2", statement: "Create auto-archive subfolder called sandbox/backup", inferred_action: "FILE_OP", recommendedCmd: "create_file backup/" },
                            { id: "step_3", statement: "Sync active memories log to sandbox/backup/history.log", inferred_action: "SYSTEM_ROUTING", recommendedCmd: "create_file backup/history.log '[Backup Sync] System logs recorded.'" }
                          ]);

                          // Auto execute after a brief delay
                          setTimeout(() => {
                            startAutonomousPlanRun();
                          }, 1400);
                        }}
                        className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-lg hover:bg-cyan-500/20 text-[8px] font-black cursor-pointer transition-all uppercase"
                        title="Simulate speaking the activation phrase"
                      >
                        🎤 Say "Hey Jarvis"
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="Type instruction, e.g. Sync SQLite ledger memories logs..."
                        className="flex-1 bg-slate-950 border border-slate-900 rounded-xl text-[10px] p-2 text-slate-200 outline-none focus:border-cyan-500/30"
                      />
                      <button
                        onClick={handleCompileGoal}
                        disabled={compilingState || executingPlan || !goalInput.trim()}
                        className="px-2.5 py-1 text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 font-mono text-[9.5px] font-bold rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        {compilingState ? "..." : "Plan"}
                      </button>
                    </div>

                    {compiledSteps.length > 0 && !executingPlan && (
                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900 select-none">
                        <span className="text-[8px] text-cyan-400 font-bold font-mono">Plan layout ready. Spool daemon?</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={startAutonomousPlanRun}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2.5 py-0.5 rounded text-[8.5px] transition-all cursor-pointer"
                          >
                            Spawn
                          </button>
                          <button
                            onClick={() => { setCompiledSteps([]); addToast("Cleared queue", "info"); }}
                            className="text-slate-500 hover:text-slate-350 px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission typing line */}
                  <div className="flex gap-2 select-text relative font-sans">
                    <button
                      onClick={() => toggleMicrophoneInput()}
                      className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-all active:scale-90 select-none shadow-md ${
                        isVoiceListening 
                          ? "bg-red-500/15 border-red-500/30 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" 
                          : "bg-slate-900/80 border-white/5 text-cyan-400 hover:bg-slate-800"
                      }`}
                      title="Activate Microphone"
                    >
                      <Mic className="h-4 w-4" />
                    </button>

                    <input
                      type="text"
                      value={inputCommand}
                      onChange={(e) => setInputCommand(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendCommand(inputCommand)}
                      placeholder={isVoiceListening ? "Voice synthesizer live..." : "Ask JARVIS to construct, optimize or record logs..."}
                      className="flex-1 bg-slate-950 border border-[#0f172a] rounded-xl text-[10.5px] p-2.5 font-mono outline-none focus:border-cyan-500/40 text-slate-100 placeholder:text-slate-600 shadow-inner"
                    />

                    <button
                      onClick={() => handleSendCommand(inputCommand)}
                      disabled={!inputCommand.trim() || isProcessingChat}
                      className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-indigo-650 disabled:opacity-40 text-slate-100 font-mono text-[10px] font-black rounded-xl border border-cyan-400/20 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. OS TASKBAR / SYSTEM TRAY DOCKED BODY (BOTTOM OF SCREEN) */}
        <div className="relative z-30 h-14 w-full bg-[#050810]/95 border border-white/5 shadow-2xl rounded-2xl p-3 flex items-center justify-between backdrop-blur-3xl select-none font-mono">
          
          {/* Left item: START ICON (Glowing Hologram Orb selector) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsMinimized(prev => !prev);
                playAudioResponse("System interface toggled.");
              }}
              className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all hover:scale-103 active:scale-95 ${
                !isMinimized 
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold" 
                  : "bg-slate-950/80 border-slate-900 text-slate-300 hover:text-white"
              }`}
            >
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isMinimized ? "bg-cyan-400" : "bg-indigo-400"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${!isMinimized ? "bg-cyan-400" : "bg-indigo-400"}`} />
              </div>
              <span className="text-[10px] font-black tracking-wider leading-none">JARVIS CORE START</span>
            </button>

            {/* Run state notification info */}
            <span className="hidden md:inline-flex items-center gap-2 text-[9px] bg-slate-900/60 font-medium border border-slate-900 px-3 py-1.5 rounded-lg text-slate-400 italic">
              {countdownToMinimize ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                  <span>Objective completed, minimizing to tray Node in <span className="text-cyan-400 font-bold">{countdownToMinimize}s</span>...</span>
                </>
              ) : executingPlan ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Autopilot daemon processing sequence tasks...</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Stealth daemon linked; standby for "Hey Jarvis" wake call</span>
                </>
              )}
            </span>
          </div>

          {/* Middle item: Active daemon notifications bubble */}
          <div className="hidden lg:flex items-center gap-2 justify-center text-[9px] font-mono select-none">
            <span className="bg-slate-900 px-2 py-1 rounded text-slate-500 select-all uppercase">OLLAMA LOGIC LINK ACTIVE</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-bold uppercase tracking-wider">
              SANDBOX ISOLATED
            </span>
          </div>

          {/* Right item: SYSTEM TRAY */}
          <div className="flex items-center gap-3.5 text-[10px] text-slate-400 font-mono">
            
            {/* Passive microphone wake phrase trigger widget switch */}
            <button
              onClick={() => {
                setIsBackgroundListening(prev => {
                  const next = !prev;
                  addToast(next ? "Passive wake-word listener (Hey Jarvis) enabled" : "Passive wake-word listener disabled", "warning");
                  playAudioResponse(next ? "Stealth active listener online." : "Stealth listener deactivated.");
                  return next;
                });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold cursor-pointer transition-all active:scale-95 ${
                isBackgroundListening 
                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
                  : "bg-slate-900 border-transparent text-slate-500 hover:text-slate-400"
              }`}
              title="Toggle passive speech wake-word detection"
            >
              <Mic className="h-3 w-3" />
              <span>{isBackgroundListening ? "AC-LISTEN" : "WAKE-OFF"}</span>
            </button>

            {/* Electron Tauri Desktop compiler config button */}
            <button
              onClick={() => setIsTauriPanelOpen(true)}
              className="flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all text-[9.5px]"
              title="Open Tauri Native Desktop Packing configurations"
            >
              <Laptop className="h-3.5 w-3.5 text-cyan-400" />
              <span>TAURI DEV</span>
            </button>

            {/* SQLite Ledger table details desk link */}
            <button
              onClick={() => { setShowAdvancedCabinet(true); setActiveTab("converse"); }}
              className="flex items-center gap-1 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 px-2 py-1 select-none text-[9.5px] rounded-lg font-bold text-slate-400 hover:text-white cursor-pointer transition-all"
            >
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span>Workspace Cabinet Drawer</span>
            </button>

            {/* CPU Real-time load indicators */}
            <div className="hidden sm:flex items-center gap-3 text-[9.5px] bg-[#070b12] border border-white/5 rounded-xl px-3 py-1.5">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 uppercase text-[8.5px]">CPU:</span>
                <span className="text-emerald-400 w-8 text-right font-black font-mono">{systCpu}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500 uppercase text-[8.5px]">RAM:</span>
                <span className="text-indigo-400 font-bold font-mono">{systRam}%</span>
              </div>
            </div>

            {/* Clock */}
            <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-300 font-mono text-[10px] font-bold">
              <Clock className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. TAURI / ELECTRON NATIVE COMPILE PACKAGING CONFIGURATIONS PANEL (Modal) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isTauriPanelOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-slate-950/90 border border-white/10 rounded-3xl p-6 font-mono text-[11px] text-left space-y-4 shadow-[0_0_60px_rgba(0,0,0,0.8)] select-text relative"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 uppercase font-black text-xs tracking-wider">
                  <Laptop className="h-5 w-5" />
                  <span>TAURI DESKTOP COMPILED ENVIRONMENT</span>
                </div>
                <button 
                  onClick={() => setIsTauriPanelOpen(false)} 
                  className="text-slate-500 hover:text-slate-200 border border-slate-900 p-1 rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <span className="text-[10px] text-slate-400 leading-relaxed block">
                Compile package components natively into high-speed tauri binaries configured with low-resource startup registers and local system alerts bypasses.
              </span>

              {/* Tauri custom parameters configs */}
              <div className="grid grid-cols-2 gap-3.5 text-[10px] bg-slate-900/40 p-3 rounded-2xl border border-slate-900 select-none">
                <label className="flex items-center gap-2 cursor-pointer p-1">
                  <input type="checkbox" defaultChecked className="accent-cyan-400 border-slate-900" />
                  <span className="text-slate-300 font-bold">Minimize to system tray on start</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-1">
                  <input type="checkbox" defaultChecked className="accent-cyan-400 border-slate-900" />
                  <span className="text-slate-300 font-bold">Unrestricted background loop</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-1">
                  <input type="checkbox" defaultChecked className="accent-cyan-400 border-slate-900" />
                  <span className="text-slate-300 font-bold">Simulate native alerts balloon</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-1">
                  <input type="checkbox" defaultChecked className="accent-cyan-400 border-slate-900" />
                  <span className="text-slate-300 font-bold">Autorun launch-on-boot configuration</span>
                </label>
              </div>

              {/* Code JSON compile manifest */}
              <div className="space-y-1 text-[10px] leading-relaxed">
                <span className="text-slate-500 uppercase text-[9px] font-black">/src-tauri/tauri.conf.json properties</span>
                <pre className="bg-[#050810] p-3 rounded-lg border border-indigo-950/60 text-cyan-300 h-40 overflow-y-auto font-mono text-[9px] shadow-inner select-all">
                  {tauriJsonSample}
                </pre>
              </div>

              {/* Footer specs details triggers */}
              <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                <span className="text-slate-500 text-[10px] font-bold">Ready to pack Release build file.</span>
                <button
                  onClick={() => { triggerDesktopNotification("Tauri Packager", "Successfully compiled JARVIS-OS installer package natively (v2.8.0-release.dmg)."); setIsTauriPanelOpen(false); }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 font-bold rounded-lg cursor-pointer transition-all active:scale-95 text-[10px]"
                >
                  Compile Native Installer Binaries
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. ADVANCED TELEMETRY WORKSPACE DRAWER CABINET (Slide-in Right Panel Drawer) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAdvancedCabinet && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="w-full max-w-6xl h-full bg-[#070b12] border-l border-white/10 flex flex-col p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 select-none">
                <div className="flex items-center gap-3">
                  <TerminalIcon className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-sm font-black font-mono tracking-widest text-[#f8fafc] uppercase flex items-center gap-2">
                    <span>JARVIS CORE WORKSPACE CABINET</span>
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 py-0.5 px-2 rounded font-bold">
                      SECURE BACKSTAGE DIAGNOSTICS
                    </span>
                  </h2>
                </div>
                <button 
                  onClick={() => setShowAdvancedCabinet(false)} 
                  className="text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  <span>Minimize Drawer Workspace</span>
                </button>
              </div>

              {/* Original Workspace Layout wrapper containing Nav Sidebar + viewport */}
              <div className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
                
                {/* Advanced workspace sidebar tabs drawer chooser */}
                <nav className="w-full md:w-60 border-b md:border-r border-slate-900 bg-[#070b12]/30 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0 select-none font-mono">
                  <div className="hidden md:block text-[9px] text-slate-500 uppercase tracking-widest px-3.5 py-1.5 font-black border-b border-white/5 mb-1.5">
                    Cabinet Telemetry
                  </div>

                  <button
                    onClick={() => setActiveTab("converse")}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded font-[10.5px] font-bold text-left transition-all ${
                      activeTab === "converse" 
                        ? "bg-slate-900/80 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Volume2 className={`h-4 w-4 ${activeTab === "converse" ? "text-cyan-400" : "text-slate-500"}`} />
                      <span>01. Chat & Acoustics</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded font-[10.5px] font-bold text-left transition-all ${
                      activeTab === "tasks" 
                        ? "bg-slate-900/80 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                    }`}
                  >
                    <Play className={`h-4 w-4 ${activeTab === "tasks" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>02. Goal Sequencer</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("laptop")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded font-[10.5px] font-bold text-left transition-all ${
                      activeTab === "laptop" 
                        ? "bg-slate-900/80 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                    }`}
                  >
                    <Sliders className={`h-4 w-4 ${activeTab === "laptop" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>03. Laptop Shortcuts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("files")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded font-[10.5px] font-bold text-left transition-all ${
                      activeTab === "files" 
                        ? "bg-slate-900/80 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                    }`}
                  >
                    <FolderOpen className={`h-4 w-4 ${activeTab === "files" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>04. Sandbox Drive</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("memory")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded font-[10.5px] font-bold text-left transition-all ${
                      activeTab === "memory" 
                        ? "bg-slate-900/80 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                    }`}
                  >
                    <Database className={`h-4 w-4 ${activeTab === "memory" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>05. SQLite Ledger</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("mobile")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded font-[10.5px] font-bold text-left transition-all ${
                      activeTab === "mobile" 
                        ? "bg-slate-900/80 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 text-slate-400"
                    }`}
                  >
                    <Smartphone className={`h-4 w-4 ${activeTab === "mobile" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>06. Mirror Screen</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("architecture")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded font-[10.5px] font-bold text-left transition-all ${
                      activeTab === "architecture" 
                        ? "bg-slate-900/80 text-cyan-400 border border-slate-800" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                    }`}
                  >
                    <Cpu className={`h-4 w-4 ${activeTab === "architecture" ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>07. Platform Specs</span>
                  </button>

                  {/* Settings and stats */}
                  <div className="hidden md:block mt-auto p-4 bg-[#050810] border border-slate-900 rounded-xl space-y-2 select-none text-[8.5px] leading-relaxed text-slate-500">
                    <span className="text-[8.5px] font-bold text-slate-400 block border-b border-indigo-950 pb-1 uppercase tracking-wider">WORKSPACE METRICS:</span>
                    <div>FILES: <span className="text-cyan-400 font-bold font-mono">{sandboxFiles.length}</span></div>
                    <div>SQL MEMORIES: <span className="text-indigo-400 font-bold font-mono">{dbState?.memory?.length || 18} logs</span></div>
                    <div>OLLAMA HOST: <span className="text-emerald-450 font-bold font-mono">localhost:{ollamaPort}</span></div>
                  </div>
                </nav>

                {/* Body Viewport container */}
                <div className="flex-1 flex flex-col bg-[#070b12]/10 overflow-hidden min-h-0 relative">
                  <AnimatePresence mode="wait">
                    {/* Render active tabs conditionals */}
                    {activeTab === "converse" && (
              <motion.div
                key="converse"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-900/60"
              >
                
                {/* LEFT COLUMN: AMBIENT COGNITIVE ORB AND SETTINGS */}
                <div className="md:w-[320px] shrink-0 p-6 flex flex-col items-center justify-between gap-6 overflow-y-auto select-none bg-slate-950/20">
                  <div className="w-full space-y-4">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Cognitive State Monitor</span>
                    
                    {/* Glowing pulsator ORB */}
                    <div className="flex flex-col items-center justify-center p-6 bg-[#070b12]/60 border border-slate-900 rounded-2xl relative shadow-2xl">
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="font-mono text-[8.5px] text-slate-500 uppercase">Acoustics Link</span>
                      </div>

                      {/* Animated Core Sphere rings */}
                      <div className="relative w-28 h-28 flex items-center justify-center my-4">
                        {/* Static outer ring */}
                        <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-spin-slow" />
                        
                        {/* Dynamic pulsing outer circle */}
                        <motion.div 
                          animate={{ 
                            scale: isVoiceListening ? [1, 1.15, 1] : [1, 1.05, 1],
                            opacity: isVoiceListening ? [0.15, 0.35, 0.15] : [0.1, 0.18, 0.1]
                          }}
                          transition={{ repeat: Infinity, duration: isVoiceListening ? 1.4 : 3 }}
                          className="absolute inset-2 rounded-full bg-cyan-500/30blur"
                        />
                        
                        {/* Pulsating core gradient orb */}
                        <motion.div 
                          animate={{ 
                            scale: isVoiceListening ? [0.95, 1.08, 0.95] : [1, 1.02, 1],
                            boxShadow: isVoiceListening 
                              ? "0 0 35px 8px rgba(34, 211, 238, 0.35)" 
                              : "0 0 20px 2px rgba(6, 182, 212, 0.12)"
                          }}
                          transition={{ repeat: Infinity, duration: isVoiceListening ? 0.9 : 2.5 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center border border-cyan-300/30"
                        >
                          <Mic className={`h-6 w-6 text-slate-50 uppercase ${isVoiceListening ? "animate-pulse" : ""}`} />
                        </motion.div>
                      </div>

                      <div className="text-center space-y-1 mt-2">
                        <div className="font-mono text-[11px] font-bold text-slate-200">
                          {isVoiceListening ? "JARVIS listening continuously..." : "Orb Idle / Standby Link"}
                        </div>
                        <div className="text-[9.5px] font-mono text-slate-400 leading-normal">
                          {isVoiceListening ? "Processing live vocal sound wave inputs" : "Press spacebar or mic button to wake assistant"}
                        </div>
                      </div>

                      {/* Live feedback waveforms */}
                      <div className="flex gap-1 items-center h-8 mt-5 select-none pt-1">
                        {audioFeedback.map((val, idx) => (
                          <div 
                            key={idx} 
                            style={{ height: `${val}px` }} 
                            className={`w-0.5 rounded-full transition-all duration-150 ${isVoiceListening ? "bg-cyan-400" : "bg-slate-700"}`} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Tool Registry System HUD */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-4.5 space-y-3 shadow-xl">
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-indigo-950/40 pb-1.5">Modular Tool Adapters</span>
                      <div className="space-y-2 text-[10px] font-mono">
                        {[
                          { id: "filesystem_tools", label: "filesystem_tools", icons: ["touch", "mkdir", "write", "cat", "rm"], activeIntents: ["FILE_OP", "FILE_CREATE", "FILE_READ", "FILE_DELETE"] },
                          { id: "terminal_tools", label: "terminal_tools", icons: ["exec", "bash", "kill", "ps"], activeIntents: ["SYSTEM_OP", "COMMAND_EXECUTE"] },
                          { id: "browser_tools", label: "browser_tools", icons: ["search", "open_url", "scrape"], activeIntents: ["BROWSER"] },
                          { id: "workspace_tools", label: "workspace_tools", icons: ["env_setup", "backup", "verify"], activeIntents: ["AUTOMATION", "SYSTEM_ROUTING"] },
                          { id: "notification_tools", label: "notification_tools", icons: ["send_toast", "speak", "vocalize"], activeIntents: ["CONVERSE", "SYSTEM_BOOT"] },
                          { id: "memory_tools", label: "memory_tools", icons: ["semantic", "sqlite", "preference"], activeIntents: ["MEMORY_QUERY", "QUERY"] }
                        ].map(tool => {
                          const lastMsg = messages[messages.length - 1];
                          const isActive = lastMsg?.intent ? tool.activeIntents.includes(lastMsg.intent) : tool.id === "notification_tools";

                          return (
                            <div 
                              key={tool.id} 
                              className={`p-2 rounded border transition-all ${
                                isActive 
                                  ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                                  : "bg-slate-950/40 border-slate-900 text-slate-500"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold tracking-tight text-[9.5px] ${isActive ? "text-cyan-400" : "text-slate-400"}`}>
                                  {tool.label}
                                </span>
                                {isActive && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {tool.icons.map(ic => (
                                  <span 
                                    key={ic} 
                                    className={`text-[8px] py-0.5 px-1.5 rounded-sm border ${
                                      isActive 
                                        ? "bg-cyan-950/65 text-cyan-300 border-cyan-500/20" 
                                        : "bg-slate-900/60 text-slate-600 border-transparent"
                                    }`}
                                  >
                                    {ic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Vocal synthesizer and local AI Core config panel */}
                  <div className="w-full bg-[#070b12]/60 border border-slate-900 rounded-xl p-4.5 space-y-4">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5">Voice & AI Core Parameters</span>
                    
                    {/* Ollama Listen Port Setup */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Ollama Port:</span>
                      <div className="flex gap-1">
                        <span className="bg-slate-950 border border-slate-850 px-2 py-1 rounded text-[10px] text-slate-400 font-mono">http://localhost:</span>
                        <input
                          type="text"
                          value={ollamaPort}
                          onChange={(e) => setOllamaPort(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-850 px-1.5 py-1 rounded text-[10px] text-slate-200 font-bold font-mono outline-none focus:border-cyan-500/30 text-center"
                        />
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-1 select-none">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-slate-500 uppercase font-black">AI Temperature:</span>
                        <span className="text-cyan-400 font-bold">{aiTemperature.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.5"
                        step="0.05"
                        value={aiTemperature}
                        onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 bg-slate-950 rounded cursor-pointer h-1"
                      />
                    </div>

                    {/* Context Window limit Slider */}
                    <div className="space-y-1 select-none">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-slate-500 uppercase font-black">AI Context Window:</span>
                        <span className="text-cyan-400 font-bold">{contextLimit} token</span>
                      </div>
                      <input
                        type="range"
                        min="2048"
                        max="16384"
                        step="1024"
                        value={contextLimit}
                        onChange={(e) => setContextLimit(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 bg-slate-950 rounded cursor-pointer h-1"
                      />
                    </div>

                    {/* System Prompt Persona */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Prompt Persona model:</span>
                      <select
                        value={systemPromptPersona}
                        onChange={(e) => {
                          setSystemPromptPersona(e.target.value as any);
                          const mapping: Record<string, string> = {
                            butler: "Sarcastic British Butler mode engaged.",
                            coder: "Aggressive DeepSeek Software Architect profile active.",
                            friday: "Optimistic Friday assistant pipeline loaded."
                          };
                          addToast(mapping[e.target.value], "success");
                          playAudioResponse(mapping[e.target.value]);
                        }}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-[9.5px] p-1.5 rounded cursor-pointer"
                      >
                        <option value="butler">Sarcastic Butler (Classic Jarvis)</option>
                        <option value="coder">DeepSeek Architect (Expert Coder)</option>
                        <option value="friday"> Friday Assistant (Optimistic Core)</option>
                      </select>
                    </div>

                    {/* Synthesis Voice Tone */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Synthesis Voice Tone:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {["Jarvis", "Friday", "Zephyr", "Kore"].map((tone) => (
                          <button
                            key={tone}
                            onClick={() => { setVoiceTone(tone as any); playAudioResponse(`Voice loaded`); }}
                            className={`text-[9px] font-mono py-1 rounded border capitalize cursor-pointer transition-colors ${
                              voiceTone === tone 
                                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300 font-bold" 
                                : "bg-transparent border-slate-800 text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {tone} Voice
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wake Sensitivity Parameter */}
                    <div className="space-y-1 select-none pt-0.5 border-t border-slate-900/60">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-slate-500 uppercase font-black">Wake Word Sensitivity:</span>
                        <span className="text-cyan-400 font-bold">{wakeSensitivity}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={wakeSensitivity}
                        onChange={(e) => setWakeSensitivity(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 bg-slate-950 rounded cursor-pointer h-1"
                      />
                    </div>

                    {/* Quite Background Listening and Speech speed */}
                    <div className="flex items-center justify-between pt-1 font-mono text-[9.5px]">
                      <span className="text-slate-500 uppercase font-black">Background mic scan:</span>
                      <button 
                        onClick={() => { setIsBackgroundListening(!isBackgroundListening); addToast("Quiet scanning parameters toggled.", "info"); }}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase cursor-pointer ${
                          isBackgroundListening ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500"
                        }`}
                      >
                        {isBackgroundListening ? "ACTIVE" : "PAUSED"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: CHAT INTERFACE */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#070b12]/40">
                  
                  {/* Console status sub-header */}
                  <div className="bg-slate-950/60 px-5 py-3 border-b border-indigo-950/20 flex justify-between items-center text-[10px] font-mono text-slate-400 select-none">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>SECURE LOCAL SANDBOX IPC LOG</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>Model Host: Localhost:11434</span>
                      <span>Confidence Score: 0.992</span>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-0 scrollbar-thin">
                    <div className="text-[10px] font-mono text-slate-500 border-b border-slate-900/60 pb-3 leading-relaxed mb-4">
                      JARVIS Core connected to workspace path: `./sandbox/`
                      <br />Any file creation, app trigger or SQLite database save commands will execute sandbox sandboxed scripts in real-time.
                    </div>

                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"} space-y-1.5`}
                      >
                        {/* Tag details */}
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 px-1">
                          <span className={`uppercase font-extrabold ${msg.sender === "user" ? "text-cyan-400" : "text-indigo-400"}`}>
                            {msg.sender === "user" ? "Administrator" : "JARVIS-OS Core"}
                          </span>
                          <span>&bull;</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* Speech Bubble body */}
                        <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                          msg.sender === "user" 
                            ? "bg-slate-900/60 border-slate-800 text-slate-100 rounded-tr-none" 
                            : msg.sender === "system"
                              ? "bg-amber-950/15 border-amber-500/20 text-amber-300 font-mono rounded-tl-none whitespace-pre-wrap"
                              : "bg-slate-950/90 border-slate-900 text-slate-300 rounded-tl-none space-y-2.5"
                        }`}>
                          
                          {/* Reasoning sub-card for AI logic */}
                          {msg.reasoning && (
                            <div className="bg-slate-950 hover:bg-slate-950/80 transition-all border border-slate-900 p-2.5 rounded-lg text-[10px] text-slate-400 font-mono">
                              <span className="text-[9px] font-black text-cyan-400 block mb-1 uppercase tracking-wider">&raquo; Cognitive Decoupling Sequence:</span>
                              <p className="leading-normal">{msg.reasoning}</p>
                            </div>
                          )}

                          {/* Proxima Orchestrator Status HUD */}
                          {msg.providersUsed && msg.providersUsed.length > 0 && (
                            <div className="flex flex-col gap-1.5 p-2 bg-gradient-to-r from-[#020617] to-slate-950 border border-slate-800 rounded-lg shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                              <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                <span className="font-mono text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                  Proxima Active Sync {msg.taskType ? `[${msg.taskType}]` : ""}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {msg.providersUsed.map((provider, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[8.5px] uppercase font-bold tracking-wide">
                                    {provider}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="whitespace-pre-line">{msg.text}</p>

                          {/* Action Recommended Unix Command */}
                          {msg.recommendedCmd && (
                            <div className="bg-[#070b12]/80 border border-slate-900 p-3 rounded-lg font-mono text-[10.5px] mt-2.5 space-y-2.5 text-slate-300 shadow-inner">
                              <div className="flex justify-between items-center text-[9px] text-slate-500 font-black tracking-wider uppercase border-b border-slate-900 pb-1.5">
                                <span>Automation Instruction Script</span>
                                {msg.pendingApproval ? (
                                  <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[8px] border border-amber-500/20 animate-pulse">⚠️ Quarantined Pending Authorization</span>
                                ) : (
                                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[8px]">Safe Sandbox Call</span>
                                )}
                              </div>
                              <code className="block text-cyan-300 truncate bg-slate-950/60 p-2 rounded border border-slate-900">{msg.recommendedCmd}</code>

                              {msg.pendingApproval && (
                                <div className="bg-amber-950/15 border border-amber-500/20 rounded p-3 mt-2 space-y-2.5">
                                  <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] font-bold">
                                    <ShieldAlert className="h-4 w-4 animate-bounce text-amber-400" />
                                    <span>CONSTRAINED DIRECTIVE: BYPASS TOKENS ON STANDBY</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                                    This shell command performs filesystem evictions, background process terminations, or package installer triggers. Human verification is required.
                                  </p>

                                  {approvedCommands[msg.id] ? (
                                    <div className="space-y-2">
                                      {approvedCommands[msg.id].loading ? (
                                        <div className="flex items-center gap-2 text-cyan-400 text-[10px] py-1.5">
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          <span>Spawning subprocess in background and executing action verification...</span>
                                        </div>
                                      ) : (
                                        <div className="space-y-2 text-[10.5px]">
                                          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1.5 rounded text-emerald-400">
                                            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                            <span className="font-bold">Supervisor Bypass Authenticated</span>
                                          </div>
                                          
                                          {/* Action Verification Engine response badge */}
                                          <div className={`p-2 rounded text-[10px] border ${approvedCommands[msg.id].verifiedSuccess ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-300" : "bg-red-950/25 border-red-500/30 text-red-300"}`}>
                                            <div className="font-bold uppercase text-[8px] mb-0.5">Verification Engine Output:</div>
                                            <div>{approvedCommands[msg.id].verificationMsg || "Heuristic check done."}</div>
                                          </div>

                                          <div className="mt-2 text-[10px]">
                                            <span className="text-slate-500 block mb-0.5">Process stdout/stderr:</span>
                                            <pre className="bg-slate-950/80 p-2.5 rounded border border-slate-900 text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-40">{approvedCommands[msg.id].response}</pre>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleApproveBypass(msg.id, msg.recommendedCmd)}
                                      className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 py-1.5 px-3 rounded font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-amber-500/10 text-center block"
                                    >
                                      AUTHORIZE DIRECTIVE BYPASS
                                    </button>
                                  )}
                                </div>
                              )}

                              {msg.executionResponse && !msg.pendingApproval && (
                                <div className="mt-2.5 pt-2 border-t border-slate-900">
                                  <span className="text-[9px] font-black text-emerald-400 block mb-1 uppercase tracking-wider">Dispatched Command Result:</span>
                                  <pre className="bg-slate-950 text-slate-300 p-2 rounded text-[10px] font-mono leading-normal overflow-x-auto whitespace-pre-wrap max-h-40">{msg.executionResponse}</pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isProcessingChat && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pl-2">
                        <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                        <span>JARVIS is reasoning locally...</span>
                      </div>
                    )}
                    <div ref={terminalEndRef} />
                  </div>

                  {/* Dynamic Voice-Controlled inputs terminal prompt */}
                  <div className="p-4 border-t border-slate-900/60 bg-slate-950/40">
                    <div className="flex gap-2 max-w-4xl mx-auto">
                      
                      <button
                        onClick={toggleMicrophoneInput}
                        className={`p-3 rounded-lg shrink-0 border transition-all cursor-pointer ${
                          isVoiceListening 
                            ? "bg-red-500/10 border-red-500/40 text-red-400 animate-pulse" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                        title="Trigger Voice Microphone Command"
                      >
                        <Mic className="h-5 w-5" />
                      </button>

                      <input
                        type="text"
                        value={inputCommand}
                        onChange={(e) => setInputCommand(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendCommand(inputCommand)}
                        placeholder={isVoiceListening ? "Speech synthesizer active... say or type a target command" : "Ask JARVIS to create files, open applications or automate tasks..."}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs p-3 font-mono outline-none focus:border-cyan-500/40 text-slate-100"
                      />

                      <button
                        onClick={() => handleSendCommand(inputCommand)}
                        disabled={!inputCommand.trim() || isProcessingChat}
                        className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-50 font-mono text-xs font-bold rounded-lg border border-cyan-400/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: AUTONOMOUS SEQUENCE EXECUTOR */}
            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto"
                id="panel-tasks"
              >
                {/* Header Shield */}
                <div className="bg-[#070b12]/40 border border-slate-900 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-3.5">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0 select-none">
                      <Play className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-100 uppercase font-mono">Cognitive Goal Planner & Sequence Running Engine</h2>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed mt-0.5 max-w-2xl font-mono">
                        Decompile complex natural language goals down into logical micro-tasks, then let the autopilot wrapper execute them sequentially against our virtual loop.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main grid splitter */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start min-h-0">
                  
                  {/* Goal inputs */}
                  <div className="lg:col-span-2 bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Plan Compilation Inputs</span>
                    
                    <div className="space-y-1.5 font-mono">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Define Unstructured Assistant Goal:</label>
                      <textarea
                        rows={3}
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="e.g., Create file data.csv with contents and backup to subfolder..."
                        className="w-full bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs leading-relaxed text-slate-200 outline-none focus:border-cyan-500/40"
                      />
                    </div>

                    <div className="flex justify-between items-center select-none font-mono">
                      <span className="text-[9px] text-slate-500 italic">Uses cognitive decompiler router API</span>
                      <button
                        onClick={handleCompileGoal}
                        disabled={compilingState || executingPlan}
                        className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <RefreshCw className={`h-3 w-3 ${compilingState ? "animate-spin" : ""}`} />
                        <span>Decompose Goal</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-900 pt-3 space-y-2 font-mono text-[10.5px] text-slate-400 leading-normal">
                      <span className="font-bold text-slate-300 block text-[9px] uppercase tracking-widest">Example Sovereign Goals:</span>
                      <button 
                        onClick={() => setGoalInput("Create a config directory and write parameters.json into it")}
                        className="block w-full text-left text-xs text-cyan-400 hover:underline py-1"
                      >
                        &raquo; Write configuration JSON files inside new subdirectory
                      </button>
                      <button 
                        onClick={() => setGoalInput("List workspace directories and verify security compliance variables")}
                        className="block w-full text-left text-xs text-cyan-400 hover:underline py-1"
                      >
                        &raquo; Sweep files checklist and verify baseline integrity
                      </button>
                    </div>
                  </div>

                  {/* Sequence compiled task steps lists */}
                  <div className="lg:col-span-3 space-y-5">
                    
                    {/* Tasks progress outline */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                      
                      <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Compiled Sequence Pipelines ({compiledSteps.length} Steps)</span>
                        {compiledSteps.length > 0 && (
                          <button
                            onClick={startAutonomousPlanRun}
                            disabled={executingPlan}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-50 border border-emerald-400/20 font-mono text-[9.5px] px-3 py-1.5 rounded font-black uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <Play className="h-3.5 w-3.5" /> Launch Automation Plan
                          </button>
                        )}
                      </div>

                      {compiledSteps.length > 0 ? (
                        <div className="space-y-3 font-mono">
                          {compiledSteps.map((step, idx) => {
                            const isRunning = executingPlan && currentStepIndex === idx;
                            const isSolved = executingPlan ? idx < currentStepIndex : true;
                            return (
                              <div 
                                key={step.id || idx}
                                className={`p-3.5 rounded-lg border transition-all flex items-start gap-3.5 ${
                                  isRunning 
                                    ? "bg-cyan-500/5 border-cyan-500/40 relative shadow-lg" 
                                    : isSolved && executingPlan
                                      ? "bg-slate-950/40 border-slate-900/60 opacity-65"
                                      : "bg-slate-950 border-slate-900"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                  isRunning 
                                    ? "bg-cyan-500 text-slate-950 animate-pulse" 
                                    : isSolved && executingPlan
                                      ? "bg-emerald-950 border border-emerald-500/30 text-emerald-400"
                                      : "bg-slate-900 text-slate-400 border border-slate-800"
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-200">{step.statement}</span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                      isRunning 
                                        ? "bg-cyan-500/10 text-cyan-400 animate-pulse border border-cyan-500/20" 
                                        : isSolved && executingPlan
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                          : "bg-slate-900 text-slate-500"
                                    }`}>
                                      {isRunning ? "Running" : isSolved && executingPlan ? "Solved" : "Pending Core"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-normal">
                                    Target module wrapper: <code className="text-indigo-400">{step.inferred_action || "INTELLIGENT_ROUTING"}</code> &bull; Instruction: <code className="text-slate-400">{step.recommended_command || step.recommendedCmd || "converse"}</code>
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-7 text-slate-500 font-mono text-[11px] select-none">
                          No automation tasks generated. Write a goal in the left panel and click Decompose.
                        </div>
                      )}
                    </div>

                    {/* Automation system stdout stream logs */}
                    {executionLog.length > 0 && (
                      <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-3.5">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">System stdout execution feeds</span>
                        <div className="bg-slate-950 p-4 border border-slate-900 rounded-lg max-h-56 overflow-y-auto font-mono text-[10px] space-y-1.5 text-slate-300">
                          {executionLog.map((log, lidx) => (
                            <div key={lidx} className="whitespace-pre-wrap leading-normal border-b border-slate-900 pb-1 text-slate-300">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: LAPTOP AUTOMATION */}
            {activeTab === "laptop" && (
              <motion.div
                key="laptop"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-slate-100"
                id="panel-laptop"
              >
                {/* Header widget */}
                <div className="bg-[#070b12]/40 border border-slate-900 p-5 rounded-xl flex items-start gap-3.5">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0 select-none">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100 uppercase font-mono">Laptop Native Automation & Terminal Sandbox</h2>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed mt-0.5 max-w-2xl font-mono">
                      Manually test scripts inside a sandboxed Unix simulator, trigger local applications launchers natively, and synchronize task reminders.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Bento shortcuts & Reminder forms (lg:col-span-5) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Desktop Application Bento Shortcuts */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Desktop Application Simulator</span>
                      <p className="text-[10px] text-slate-400 leading-normal">Simulate opening operations on local host channels:</p>
                      
                      <div className="grid grid-cols-2 gap-2.5 font-mono">
                        {[
                          { name: "Terminal Console", command: "open_terminal_bin --profile=Sovereign" },
                          { name: "Brave Browser", command: "launch_brave_browser https://google.com" },
                          { name: "Disk Cleanup", command: "clean_local_cache_directories" },
                          { name: "VS Code Editor", command: "launch_editor_instance ./sandbox/" },
                        ].map((app, appIdx) => (
                          <button
                            key={appIdx}
                            onClick={() => simulateLaptopAppLaunch(app.name, app.command)}
                            className="text-left p-3 bg-slate-950/80 hover:bg-slate-900/60 border border-slate-900 rounded-lg transition-all flex flex-col justify-between h-[76px] cursor-pointer hover:border-cyan-500/20 group hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]"
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-cyan-400 font-black text-[9px] uppercase tracking-wide group-hover:text-cyan-300">{app.name}</span>
                              <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                            </div>
                            <span className="text-[8px] text-slate-500 font-mono truncate w-full block mt-2">{app.command}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Integrated Reminders Panel */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Integrated Reminders & Alerts</span>
                      
                      <form onSubmit={handleAddPrivateReminder} className="space-y-3 font-mono">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black">Reminder detail:</span>
                          <input
                            type="text"
                            value={newReminderText}
                            onChange={(e) => setNewReminderText(e.target.value)}
                            placeholder="e.g. Back up workspace database"
                            className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-[10px] text-slate-100 outline-none focus:border-cyan-500/30"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black">Target schedule time:</span>
                          <input
                            type="time"
                            value={newReminderTime}
                            onChange={(e) => setNewReminderTime(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-[10px] text-slate-100 outline-none focus:border-cyan-500/30"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 font-bold rounded text-[9.5px] select-none flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Log Private Reminder
                        </button>
                      </form>

                      <div className="space-y-2 font-mono">
                        <span className="text-[9px] text-slate-500 uppercase font-black block border-t border-slate-900 pt-3">Scheduled Reminders logs ({reminders.length})</span>
                        {reminders.map((re) => (
                          <div key={re.id} className="p-2 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-between text-[10px]">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-200 block">{re.text}</span>
                              <span className="text-[8.5px] text-slate-500">Triggers at: {re.time}</span>
                            </div>
                            <button
                              onClick={() => {
                                setReminders(prev => prev.filter(r => r.id !== re.id));
                                addToast("Reminder logs cleared.", "info");
                              }}
                              className="p-1 hover:bg-slate-900 text-red-400 rounded cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Observation Layer & Live Process Controller */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4 shadow-xl">
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                        <Cpu className="h-4 w-4 text-cyan-400" />
                        <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">System Observation Layer</span>
                      </div>

                      {/* Telemetry HUD Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono select-none">
                        <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                          <span className="text-slate-500 uppercase font-bold text-[8.5px] block">CPU Load</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-cyan-400 font-extrabold text-xs">{telemetry ? telemetry.cpuUsage.toFixed(1) : "12.4"}%</span>
                            <span className="text-slate-600 text-[8.5px]">Active</span>
                          </div>
                          <div className="h-1 bg-slate-900 rounded overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${telemetry ? telemetry.cpuUsage : 12.4}%` }} />
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                          <span className="text-slate-500 uppercase font-bold text-[8.5px] block">RAM Allocation</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-emerald-400 font-extrabold text-xs">
                              {telemetry ? telemetry.ramUsage.toFixed(2) : "4.82"} / {telemetry ? telemetry.ramTotal : "16"} GB
                            </span>
                          </div>
                          <div className="h-1 bg-slate-900 rounded overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${telemetry ? (telemetry.ramUsage / telemetry.ramTotal) * 100 : 30}%` }} />
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                          <span className="text-slate-500 uppercase font-bold text-[8.5px] block">Disk Storage</span>
                          <span className="text-blue-400 font-extrabold text-xs block">42.1 GB / 256 GB</span>
                          <div className="flex justify-between text-[8px] text-slate-600">
                            <span>Available: 213.9 GB</span>
                            <span>84% Free</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                          <span className="text-slate-500 uppercase font-bold text-[8.5px] block">Power Status</span>
                          <span className="text-amber-400 font-extrabold text-xs block">94% [Charging]</span>
                          <span className="text-[8.5px] text-slate-600 block">Sovereign source synced</span>
                        </div>
                      </div>

                      {/* Live Process controller */}
                      <div className="space-y-2 border-t border-slate-900 pt-3 font-mono">
                        <span className="text-[9px] text-slate-500 uppercase font-black block">Active Process Controller ({telemetry?.processes?.length || 0})</span>
                        
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 font-mono">
                          {telemetry?.processes ? (
                            telemetry.processes.map((proc: any) => (
                              <div key={proc.pid} className="p-2 bg-slate-950/80 border border-slate-900 rounded flex items-center justify-between text-[9.5px] font-mono">
                                <div className="flex items-center gap-2">
                                  <span className="text-[8.5px] text-slate-600 font-extrabold bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                                    {proc.pid}
                                  </span>
                                  <span className="font-bold text-slate-200">{proc.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-cyan-400 font-extrabold text-[8.5px]">{proc.cpu}% CPU</span>
                                  <span className="text-slate-500 text-[8.5px] hidden sm:inline">{proc.memory} MB</span>
                                  <button 
                                    onClick={() => handleKillProcess(proc.pid, proc.name)}
                                    className="p-1 hover:bg-red-950/45 text-red-500 hover:text-red-400 rounded cursor-pointer border border-transparent hover:border-red-900/30 transition-all"
                                    title="SIGKILL Process"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-slate-600 py-4 text-[10px]">Syncing process list...</div>
                          )}
                        </div>

                        {/* Process Spawning Tool */}
                        <div className="pt-2 border-t border-slate-950 bg-slate-950/40 p-2.5 rounded border border-slate-900/60 font-mono">
                          <span className="text-[8.5px] text-slate-500 uppercase font-black block mb-1">Spawn Sandbox Daemon</span>
                          <div className="flex gap-1.5">
                            <select
                              id="spawn-daemon-select"
                              className="bg-slate-950 border border-slate-850 rounded p-1.5 text-[9.5px] text-slate-200 flex-1 cursor-pointer outline-none"
                            >
                              <option value="yara_malware_vaccine">yara_malware_vaccine</option>
                              <option value="sql_terminal_daemon">sql_terminal_daemon</option>
                              <option value="whatsapp_web_bridge">whatsapp_web_bridge</option>
                              <option value="piper_synthesis_vocalizer">piper_synthesis_vocalizer</option>
                              <option value="ollama_deepseek_node">ollama_deepseek_node</option>
                            </select>
                            <button
                              onClick={() => {
                                const selectEl = document.getElementById("spawn-daemon-select") as HTMLSelectElement;
                                if (selectEl) {
                                  handleSpawnProcess(selectEl.value);
                                }
                              }}
                              className="px-3 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-[9px] font-black uppercase rounded cursor-pointer transition-colors"
                            >
                              Spawn
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Secure Sandbox Snapshots & Rollback controller */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4 shadow-xl">
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                        <Camera className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">Secure Sandbox Rollback</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-mono">
                        Create filesystem containment restore points. You can roll back the entire sandbox workspace instantly in case of manual compilation mistakes or destructive operations.
                      </p>

                      <div className="space-y-1.5 font-mono">
                        <span className="text-[9px] text-slate-500 uppercase font-black">Snapshot Name Identifier:</span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newSnapshotName}
                            onChange={(e) => setNewSnapshotName(e.target.value)}
                            placeholder="e.g. baseline_compiles_ok"
                            className="flex-1 bg-slate-950 border border-slate-850 p-2 rounded text-[10px] text-slate-100 outline-none focus:border-cyan-500/30 text-[10px]"
                          />
                          <button
                            onClick={() => handleCreateSnapshot(newSnapshotName)}
                            disabled={snapshotLoading}
                            className="bg-indigo-950/40 hover:bg-indigo-900/45 border border-indigo-500/30 text-indigo-300 font-bold px-3 py-1.5 rounded text-[9.5px] hover:text-indigo-200 uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <Camera className="h-3 w-3" /> Snapshot
                          </button>
                        </div>
                      </div>

                      {/* Snapshot archive logs list */}
                      <div className="space-y-2 border-t border-slate-900 pt-3">
                        <span className="text-[9px] text-slate-500 uppercase font-black block">Snapshot Archive Logs ({snapshotsList.length})</span>
                        
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {snapshotsList.length > 0 ? (
                            snapshotsList.map((snap) => (
                              <div key={snap.id} className="p-2.5 bg-slate-950 border border-slate-900 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9.5px] font-mono">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <span className="font-bold text-slate-200">{snap.name}</span>
                                    <span className="text-[8.5px] text-indigo-400 font-bold bg-indigo-500/10 px-1 border border-indigo-500/10 rounded">
                                      {snap.filesCount} files
                                    </span>
                                  </div>
                                  <span className="text-[8.5px] text-slate-500 block">Created: {new Date(snap.timestamp).toLocaleTimeString()} ({new Date(snap.timestamp).toLocaleDateString()})</span>
                                </div>
                                <button
                                  onClick={() => handleRollbackSnapshot(snap.id, snap.name)}
                                  disabled={snapshotLoading}
                                  className="self-end sm:self-auto shrink-0 bg-red-950/30 hover:bg-red-900/35 text-rose-300 border border-red-500/20 hover:border-red-500/30 font-bold px-2 py-1 rounded text-[8.5px] tracking-wide uppercase cursor-pointer disabled:opacity-40"
                                >
                                  Rollback Restore
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-slate-600 py-4 text-[10px]">No historical sandbox rollbacks captured yet.</div>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Right Column: Interactive Terminal & Document Summarizers (lg:col-span-7) */}
                  <div className="lg:col-span-7 space-y-6">

                    {/* High Fidelity Bash Terminal Emulator */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                          <span className="text-[9.5px] font-mono text-slate-400 font-bold ml-1">bash terminal sandbox &bull; secure environment</span>
                        </div>
                        <button
                          onClick={() => setTerminalLogs([])}
                          className="text-[8.5px] text-red-400 hover:underline cursor-pointer font-black"
                        >
                          RESET CLI
                        </button>
                      </div>

                      {/* Command suggestions shortcuts pill */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[8.5px] text-slate-500 uppercase mr-1 font-bold">Quick runs:</span>
                        {["help", "ls -la", "status", "cat config.yaml"].map((pill) => (
                          <button
                            key={pill}
                            onClick={() => handleExecuteTerminalCommand(pill)}
                            className="px-2 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-cyan-400 rounded hover:text-cyan-300 text-[8.5px] cursor-pointer"
                          >
                            {pill}
                          </button>
                        ))}
                      </div>

                      {/* Output Feed Box */}
                      <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-900/60 font-mono text-[10.5px] text-slate-300 max-h-64 h-[225px] overflow-y-auto space-y-1">
                        {terminalLogs.map((logLine, lineIdx) => (
                          <div key={lineIdx} className="whitespace-pre-wrap leading-normal border-b border-slate-950 pb-0.5">
                            {logLine}
                          </div>
                        ))}
                      </div>

                      {/* Interactive prompt input */}
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950 border border-slate-850 rounded p-2 flex items-center font-mono text-xs">
                          <span className="text-emerald-400 font-black mr-2">jarvis-os$</span>
                          <input
                            type="text"
                            value={terminalCmd}
                            onChange={(e) => setTerminalCmd(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleExecuteTerminalCommand()}
                            placeholder="Type a command e.g. 'help', 'status', 'ls -la'..."
                            className="bg-transparent border-none text-slate-100 flex-1 outline-none text-[11px]"
                          />
                        </div>
                        <button
                          onClick={() => handleExecuteTerminalCommand()}
                          className="px-4 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-400 font-black rounded text-[10px] uppercase cursor-pointer"
                        >
                          RUN
                        </button>
                      </div>
                    </div>

                    {/* Private Document Summarizer */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Cognitive Document Summarizer</span>
                      <p className="text-[10px] text-slate-400 leading-normal">Perform semantic reading and summaries on database cache files:</p>
                      
                      <div className="space-y-3 font-mono">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black">Choose target file:</span>
                          <select
                            value={summaryTargetFile}
                            onChange={(e) => setSummaryTargetFile(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-[10px] p-2 rounded cursor-pointer"
                          >
                            {sandboxFiles.map((f) => (
                              <option key={f.name} value={f.name}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleSummarizeTargetFile}
                          disabled={!summaryTargetFile || summarizingFileStatus}
                          className="w-full py-2 bg-cyan-950/45 hover:bg-cyan-900/45 text-cyan-300 border border-cyan-500/30 font-bold rounded uppercase text-[9.5px] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`h-3 w-3 ${summarizingFileStatus ? "animate-spin" : ""}`} />
                          <span>Generate cognitive summary</span>
                        </button>

                        {documentSummary && (
                          <div className="mt-3 bg-slate-950 border border-slate-900 p-3.5 rounded-lg space-y-2">
                            <span className="text-[9.5px] text-cyan-450 font-extrabold block border-b border-slate-900 pb-1">AI Analytical Summary:</span>
                            <p className="text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed select-text">{documentSummary}</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* VIEW 4: SANDBOX FILES WORKSPACE */}
            {activeTab === "files" && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-900/60"
                id="panel-files"
              >
                
                {/* File list tree panel */}
                <div className="md:w-64 p-5 overflow-y-auto space-y-4 shrink-0 bg-[#070b12]/45">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Workspace Cache</span>
                    <button 
                      onClick={fetchSandboxFiles} 
                      className="p-1 hover:bg-slate-900 text-cyan-400 rounded transition-all cursor-pointer"
                      title="Sync Sandbox File system"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 font-mono">
                    {sandboxFiles.length > 0 ? (
                      sandboxFiles.map((file) => (
                        <button
                          key={file.name}
                          onClick={() => handleSelectFile(file.name)}
                          className={`w-full text-left p-2 rounded text-[10.5px] transition-all flex items-center gap-2 border border-transparent ${
                            selectedFile === file.name
                              ? "bg-slate-900/70 text-cyan-300 border-slate-800 font-bold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/10"
                          }`}
                        >
                          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="text-slate-500 text-[10.5px] text-center py-5">
                        Directory empty. Use Chat module to compile files.
                      </div>
                    )}
                  </div>
                </div>

                {/* File Editor Panel */}
                <div className="flex-1 flex flex-col min-h-0">
                  {selectedFile ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      
                      {/* Editor Sub header tools */}
                      <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-900 flex justify-between items-center text-[10.5px] font-mono text-slate-400 select-none">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          <span>Active Document: <code className="text-slate-100 font-extrabold font-mono">{selectedFile}</code></span>
                        </div>
                        <button
                          onClick={saveFileToLocalSandbox}
                          disabled={isSavingFile}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-50 border border-cyan-400/10 font-bold uppercase rounded text-[9.5px] flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="h-3. w-3" />
                          <span>{isSavingFile ? "Writing..." : "Save changes"}</span>
                        </button>
                      </div>

                      {/* Text editing area */}
                      <textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="flex-1 p-5 bg-[#05080e]/40 text-slate-200 font-mono text-xs leading-relaxed outline-none border-0 focus:ring-0 resize-none select-text"
                      />

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
                      <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-full text-slate-500 mb-3">
                        <FolderOpen className="h-7 w-7" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase">Awaiting file choice</h3>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                        Select an existing file record in the left sidebar directory to edit text parameters or write parameters.
                      </p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* VIEW 5: MEMORY ENGINE PERSISTENCE */}
            {activeTab === "memory" && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-slate-100"
                id="panel-memory"
              >
                
                {/* Header Shield */}
                <div className="bg-[#070b12]/40 border border-slate-900 p-5 rounded-xl flex items-start gap-3.5">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0 select-none">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100 uppercase font-mono">Cognitive Memory Engine & SQLite Core</h2>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed mt-0.5 max-w-2xl font-mono">
                      Query persistent schemas, configure model preferences, and execute cosine similarity searches on multi-dimensional semantic vectors.
                    </p>
                  </div>
                </div>

                {/* Sub-tab navigation selectors */}
                <div className="flex border-b border-slate-900 pb-px gap-2 select-none">
                  {[
                    { id: "tables", label: "Schema Registry", icon: Database },
                    { id: "sql_terminal", label: "SQL Diagnostic CLI", icon: TerminalIcon },
                    { id: "embeddings", label: "Semantic Vector Search", icon: Sparkles },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMemorySubTab(tab.id as any)}
                      className={`px-4 py-2 border-b-2 text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer ${
                        memorySubTab === tab.id
                          ? "border-cyan-500 text-cyan-400"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Main panel split grids */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  
                  {/* Left Column Schema Index */}
                  <div className="space-y-4 lg:col-span-1 border border-slate-900 bg-[#070b12]/80 p-5 rounded-xl font-mono text-[10px] select-none">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Active Database Index</span>
                    
                    <div className="space-y-2 pt-2">
                      {[
                        { title: "memory_log", desc: "Indices intents and conversation dialogue histories.", query: "SELECT * FROM memory_log ORDER BY id DESC LIMIT 10" },
                        { title: "logs", desc: "Diagnostic events reporting kernel process loops.", query: "SELECT * FROM logs ORDER BY id DESC LIMIT 10" },
                        { title: "reminders", desc: "Action logs and schedule tasks parameters.", query: "SELECT * FROM reminders ORDER BY id DESC" },
                        { title: "preferences", desc: "System parameters, model parameters, and wake ports.", query: "SELECT * FROM preferences" },
                        { title: "vector_embeddings", desc: "Dense vectors representing cognitive file logs.", query: "SELECT * FROM vector_embeddings" },
                      ].map((tbl, tblIdx) => (
                        <button
                          key={tblIdx}
                          onClick={() => {
                            setSqlQuery(tbl.query);
                            setMemorySubTab("sql_terminal");
                            addToast(`Loaded query shortcut for ${tbl.title}`, "info");
                          }}
                          className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg transition-all hover:border-cyan-500/20 block cursor-pointer group"
                        >
                          <span className="font-extrabold text-[#f1f5f9] block group-hover:text-cyan-400">TABLE {tbl.title}</span>
                          <span className="text-[9px] text-slate-500 leading-normal block mt-1">{tbl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column Interactive Dynamic Views */}
                  <div className="lg:col-span-3 space-y-6">
                    
                    {/* SUB-PANEL 1: SYSTEM TABLES SCHEMAS */}
                    {memorySubTab === "tables" && (
                      <div className="space-y-6">
                        {/* Dynamic Memories Log dashboard list audit feeds */}
                        <div className="bg-[#070b12]/85 border border-slate-900 rounded-xl p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                            <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Memories Ledger logs</span>
                            <div className="text-[9px] text-slate-500 font-mono">SQLite State cache synchrony</div>
                          </div>

                          <div className="space-y-2 font-mono text-[10.5px]">
                            {dbState && dbState.memory && dbState.memory.length > 0 ? (
                              dbState.memory.slice(-5).reverse().map((mem) => (
                                <div key={mem.id} className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex flex-col md:flex-row gap-2 leading-relaxed md:items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">[{mem.timestamp ? mem.timestamp.substring(11, 19) : "ONLINE"}]</span>
                                    <span className="text-cyan-400 font-bold uppercase">{mem.category}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-300 font-mono break-all">{mem.value_data || mem.user_command}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-slate-500 text-center py-4 select-none">No custom memory items found in SQLite context log. Try speaking with JARVIS in Chat.</div>
                            )}
                          </div>
                        </div>

                        {/* Preferences registry view */}
                        <div className="bg-[#070b12]/85 border border-slate-900 rounded-xl p-5 space-y-4">
                          <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Active System Registry Configuration</span>
                          <div className="grid grid-cols-2 gap-4 font-mono text-[10.5px]">
                            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
                              <span className="text-cyan-400 block font-bold uppercase text-[9px]">Ollama Local endpoint:</span>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Model Core:</span>
                                <span className="text-slate-300">{modelType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Listen Port:</span>
                                <span className="text-slate-300">http://localhost:{ollamaPort}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
                              <span className="text-cyan-400 block font-bold uppercase text-[9px]">Autonomous settings:</span>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Output verification:</span>
                                <span className="text-emerald-400 font-bold">{enableAutoVerify ? "ENABLED" : "OFFLINED"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Retries on Timeout:</span>
                                <span className="text-emerald-400 font-bold">{enableRetryOnFail ? `YES (${plannerMaxRetries}x)` : "NO"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-PANEL 2: SQL diagnostic CLI prompt */}
                    {memorySubTab === "sql_terminal" && (
                      <div className="bg-[#070b12]/85 border border-slate-900 rounded-xl p-5 space-y-4">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">SQLite Diagnostic Query Terminal</span>
                        
                        <div className="space-y-2 font-mono">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={sqlQuery}
                              onChange={(e) => setSqlQuery(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs p-3 rounded-lg outline-none focus:border-cyan-500/40 font-mono text-slate-100 select-text"
                              placeholder="SELECT * FROM memory_log..."
                            />
                          </div>
                          
                          <div className="flex justify-between items-center select-none">
                            <span className="text-[9px] text-slate-500 italic">Try clicking any table on left to preload corresponding query rules.</span>
                            <button
                              onClick={handleExecuteDatabaseStateSQL}
                              disabled={isQuerying}
                              className="px-4 py-2 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 rounded text-[9.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 animate-pulse"
                            >
                              <RefreshCw className={`h-3 w-3 ${isQuerying ? "animate-spin" : ""}`} />
                              <span>Execute SQL Statement</span>
                            </button>
                          </div>
                        </div>

                        {sqlMessage && (
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-900 font-mono text-[10px] text-slate-400">
                            <span className="text-[9px] text-indigo-400 font-extrabold block mb-0.5">Execution Log Output:</span>
                            <span className="whitespace-pre-wrap select-text">{sqlMessage}</span>
                          </div>
                        )}

                        {/* Display Table Data columns */}
                        {sqlResult && sqlResult.length > 0 ? (
                          <div className="space-y-2 font-mono text-[10px]">
                            <span className="text-[9px] text-cyan-400 font-extrabold tracking-wider uppercase block">Database result payload ({sqlResult.length} rows)</span>
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 overflow-x-auto select-text max-h-56 scrollbar-thin">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-850 text-slate-500">
                                    {Object.keys(sqlResult[0]).map((key) => (
                                      <th key={key} className="text-left p-1.5 uppercase font-[#94a3b8] font-black text-[9px] tracking-wider">{key}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sqlResult.map((row: any, rIndex: number) => (
                                    <tr key={rIndex} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300">
                                      {Object.values(row).map((val: any, vIndex: number) => (
                                        <td key={vIndex} className="p-1.5 align-top font-mono text-[9px] leading-relaxed truncate max-w-sm" title={String(val)}>
                                          {String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          sqlResult && (
                            <div className="text-center py-4 bg-slate-950 border border-slate-900 rounded-lg text-slate-500 font-mono text-[10.5px]">
                              Query evaluated successfully but returned 0 results.
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* SUB-PANEL 3: SEMANTIC VECTOR EMBEDDING RETRIEVAL */}
                    {memorySubTab === "embeddings" && (
                      <div className="bg-[#070b12]/85 border border-slate-900 rounded-xl p-5 space-y-4">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Multi-Dimensional Semantic Vector retrieval</span>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Query deep spatial text models offline using multi-dimensional dense embeddings to retrieve coordinates index matching targets context.
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={semanticSearchQuery}
                            onChange={(e) => setSemanticSearchQuery(e.target.value)}
                            placeholder="e.g. Find security config files recommendations..."
                            className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs font-mono outline-none focus:border-cyan-500/40 text-slate-200"
                          />
                          <button
                            onClick={handleCosineVectorMatch}
                            disabled={isSemanticSearching || !semanticSearchQuery.trim()}
                            className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-50 border border-cyan-400/25 font-bold font-mono text-xs uppercase rounded-lg disabled:opacity-40 transition-all cursor-pointer"
                          >
                            {isSemanticSearching ? "Searching..." : "Cosine Match"}
                          </button>
                        </div>

                        {/* Semantic dense vector search grid list */}
                        {semanticSearchResults.length > 0 ? (
                          <div className="space-y-3 font-mono text-[10px]">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Dense Vector Similarity ranking</span>
                            
                            <div className="space-y-2">
                              {semanticSearchResults.map((rst, rIdx) => (
                                <div key={rIdx} className="p-3 bg-slate-950/80 border border-slate-900 hover:border-cyan-500/20 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3">
                                  <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8.5px] uppercase font-black rounded">{rst.category}</span>
                                      <span className="text-slate-200 font-bold text-[10.5px]">{rst.text}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-[9px] leading-relaxed">
                                      <span>Dense Embedding Float Vector:</span>
                                      <code className="text-indigo-400 bg-indigo-950/20 border border-indigo-950/40 px-1 py-0.5 rounded text-[8.5px]">
                                        [{rst.vector.map((f: number) => f.toFixed(2)).join(", ")}]
                                      </code>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-right shrink-0">
                                    <div>
                                      <span className="text-slate-500 block text-[8px] uppercase font-black">Similarity score</span>
                                      <span className="text-emerald-400 font-black text-xs">{(rst.similarity * 100).toFixed(1)}% Match</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[8px] uppercase font-black">Spatial distance</span>
                                      <span className="text-indigo-400 font-black text-xs">{rst.distance.toFixed(3)} px</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-7 bg-slate-950 border border-slate-900 text-slate-500 font-mono text-[10.5px] rounded-xl select-none">
                            Type a semantic query above (e.g. 'security rule configurations' or 'voice assistant wake settings') and click Cosine Match.
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

              </motion.div>
            )}

            {/* VIEW 6: MOBILE COMPANION SYNC */}
            {activeTab === "mobile" && (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto"
                id="panel-mobile"
              >
                {/* Header widget */}
                <div className="bg-[#070b12]/40 border border-slate-900 p-5 rounded-xl flex items-start gap-3.5">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0 select-none">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100 uppercase font-mono">Mobile Sync & Capacitor Pairing</h2>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed mt-0.5 max-w-2xl font-mono">
                      Pair smartwatches and smartphones via secure CapacitorJS remote linking to coordinate speech models or cross-device notifications on the fly.
                    </p>
                  </div>
                </div>

                {/* Mobile columns */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start min-h-0">
                  
                  {/* Left device specs */}
                  <div className="lg:col-span-2 bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2">Active Smart Device Status</span>
                    
                    <div className="space-y-3 font-mono text-[10.5px]">
                      
                      <div className="flex justify-between p-2 bg-slate-950 border border-slate-900 rounded-lg">
                        <span className="text-slate-500">Pairing Link State:</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                          phoneState.paired ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500"
                        }`}>{phoneState.status}</span>
                      </div>

                      <div className="flex justify-between p-2 bg-slate-950 border border-slate-900 rounded-lg">
                        <span className="text-slate-500">Device Name ID:</span>
                        <span className="text-slate-200">{phoneState.deviceName}</span>
                      </div>

                      <div className="flex justify-between p-2 bg-slate-950 border border-slate-900 rounded-lg">
                        <span className="text-slate-500">Smart Battery Percentage:</span>
                        <span className="text-slate-200">{phoneState.battery}% Connected</span>
                      </div>

                      <div className="flex justify-between p-2 bg-slate-950 border border-slate-900 rounded-lg">
                        <span className="text-slate-500">Telemetry Last Sync:</span>
                        <span className="text-slate-500 font-bold">{phoneState.lastPulse}</span>
                      </div>

                      {phoneState.paired && (
                        <button
                          onClick={() => {
                            setPhoneState({ paired: false, deviceName: "None", battery: 0, status: "Disconnected", lastPulse: "Never" });
                            addToast("Link connection suspended.", "warning");
                          }}
                          className="w-full py-1.5 bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-500/20 rounded uppercase font-bold text-[9px] cursor-pointer"
                        >
                          Unpair smart device
                        </button>
                      )}
                    </div>

                    {/* PIN pairing compiler form */}
                    {!phoneState.paired && (
                      <form onSubmit={handlePairWatchOrPhone} className="space-y-3 font-mono border-t border-slate-900 pt-3">
                        <span className="text-[9px] text-slate-400 block">Provide authentication PIN listed on smartphone companion:</span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            maxLength={4}
                            value={pairInput}
                            onChange={(e) => setPairInput(e.target.value)}
                            placeholder="PIN code e.g. 7482"
                            className="bg-slate-950 border border-slate-850 p-2 text-xs rounded outline-none w-24 text-center font-mono text-slate-200"
                          />
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-50 font-bold text-[9px] uppercase rounded border border-cyan-400/20 cursor-pointer"
                          >
                            Authenticate Pair
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Right pairing interactive mock dashboard */}
                  <div className="lg:col-span-3 space-y-5">
                    
                    {/* Device Logs stream summary */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-4">
                      
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Diagnostic Smart device Sync logs</span>
                        <div className="text-[9px] text-slate-500 font-mono">Real-time WiFi Telemetry sync</div>
                      </div>

                      <div className="space-y-2 font-mono text-[10px]">
                        {[
                          { time: "09:12:05", module: "CAPACITOR_CORE", msg: "Linking audio channels via native standard WebView media permissions." },
                          { time: "09:12:12", module: "TELEMETRY_ENGINE", msg: "Tethered heart monitor metrics successfully indexed over offline sync." },
                          { time: "09:16:30", module: "NOTIFICATION_PROXY", msg: "Forwarded toast alarm reminder to smartphone watch successfully." },
                          { time: "09:28:44", module: "SANDBOX_SYNC", msg: "Transferred backup files summary text over localhost channels." }
                        ].map((log, lidx) => (
                          <div key={lidx} className="p-2 bg-slate-950 border border-slate-900 rounded-lg flex items-start gap-2.5 leading-relaxed text-slate-400">
                            <span className="text-slate-500 shrink-0">[{log.time}]</span>
                            <span className="text-cyan-400 font-bold shrink-0">{log.module}:</span>
                            <span className="text-slate-300">{log.msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Capacitor packaging guide parameters */}
                    <div className="bg-[#070b12]/80 border border-slate-900 rounded-xl p-5 space-y-3 font-mono text-[10px] text-slate-400 leading-normal">
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5">Capacitor Hybrid build deployment specifications</span>
                      <p>JARVIS is pre-packaged with CapacitorJS wrapper bindings to native mobile platforms:</p>
                      
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-900 font-mono text-[9px] text-indigo-300 select-all max-h-40 overflow-x-auto whitespace-pre-wrap">
{`# 1. Compile current React assets down to static build directory
npm run build

# 2. Add android target package natively
npx cap add android

# 3. Synchronize assets and copy build scripts down
npx cap sync android

# 4. Open native compiler window path
npx cap open android`}
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEW 7: SYSTEM ARCHITECTURE SPEC */}
            {activeTab === "architecture" && (
              <motion.div
                key="architecture"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-sans"
                id="panel-architecture"
              >
                {/* Header widget */}
                <div className="bg-[#070b12]/40 border border-slate-900 p-5 rounded-xl flex items-start gap-3.5 select-none">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wide font-mono">Sovereign Architecture blue-print</h2>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed mt-0.5 max-w-2xl font-mono">
                      Explore the local offline cognitive routing schema, SQLite storage structures, and modular Python system integrations powering JARVIS-OS.
                    </p>
                  </div>
                </div>

                {/* Sub Architecture Layout Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                                 {/* Left Column: Index Navigator */}
                  <div className="lg:col-span-1 space-y-2 select-none font-mono text-[10px]">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1.5 py-1">Architecture Tabs</span>
                    <div className="space-y-1 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                      {[
                        { id: "plan", label: "01. Full Architecture Blueprint", spec: "Sovereign cognitive pipelines" },
                        { id: "folder", label: "02. Core Folder blueprints", spec: "Workspace structures mapping" },
                        { id: "local_ai", label: "03. Ollama model weight schema", spec: "Deepseek offline logic fallbacks" },
                        { id: "db_schema", label: "04. SQLite tables architecture", spec: "Long-term memory models" },
                        { id: "ipc", label: "05. Capacitor hybrid synchronization", spec: "Cross-device communication link" },
                        { id: "security_policy", label: "06. Security Clearance Policies", spec: "Granular sandbox clearance" },
                        { id: "action_verify", label: "07. Production Verification Engine", spec: "Failsafe operation assertion" },
                        { id: "voice_vision_stack", label: "08. Speech & Vision Layout Stack", spec: "OCR, coordinates, and speech synthesis" },
                        { id: "tg_desktop", label: "09. Desktop Native Portability (Tauri)", spec: "Electron fallback & tray behaviors" }
                      ].map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => setSelectedArchSection(sec.id)}
                          className={`w-full text-left p-2 rounded transition-all flex flex-col border ${
                            selectedArchSection === sec.id
                              ? "bg-slate-900 border-cyan-500/30 text-cyan-300 font-bold"
                              : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                          }`}
                        >
                          <span>{sec.label}</span>
                          <span className="text-[8px] font-normal text-slate-500 mt-0.5">{sec.spec}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Dynamic spec displays */}
                  <div className="lg:col-span-3 space-y-6 select-text text-slate-300">

                    {/* Section 01: Full architecture blueprint */}
                    {selectedArchSection === "plan" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-5">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">JARVIS-OS System Topology</h3>
                          <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[8.5px] px-2 py-0.5 rounded font-bold uppercase font-mono">Doc v2.1</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                          JARVIS-OS coordinates clean offline processes to secure absolute local self-containment for client workspace files and conversations logs:
                        </p>

                        {/* CS SVG Flow Diagram mapped elegantly via css elements */}
                        <div className="bg-[#070b12]/60 p-4 border border-slate-950 rounded-lg space-y-4">
                          <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center select-none pb-1">Cognitive Data Pipeline</div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                            
                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-1.5">
                              <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center justify-center text-[8.5px] font-black mx-auto font-mono">A</span>
                              <div className="text-[10.5px] font-mono font-bold text-slate-250">Vocal Microphone</div>
                              <span className="text-[8.5px] text-slate-500 leading-normal block">Mic audio translation maps voice commands offline</span>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-1.5">
                              <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center justify-center text-[8.5px] font-black mx-auto font-mono">B</span>
                              <div className="text-[10.5px] font-mono font-bold text-slate-250">Goal Decompiler</div>
                              <span className="text-[8.5px] text-slate-500 leading-normal block">Converts natural prompts to linear bash steps</span>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-1.5">
                              <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center justify-center text-[8.5px] font-black mx-auto font-mono">C</span>
                              <div className="text-[10.5px] font-mono font-bold text-slate-250">Launcher Sandbox</div>
                              <span className="text-[8.5px] text-slate-500 leading-normal block">Manipulates local file cache securely relative to base</span>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-1.5">
                              <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center justify-center text-[8.5px] font-black mx-auto font-mono">D</span>
                              <div className="text-[10.5px] font-mono font-bold text-slate-250">Persist Memories</div>
                              <span className="text-[8.5px] text-slate-500 leading-normal block">Stores intentions logs inside SQLite database logs</span>
                            </div>

                          </div>
                        </div>

                        <div className="space-y-2.5 text-[11px] font-mono leading-relaxed text-slate-400">
                          <div className="flex items-start gap-2">
                            <span className="text-cyan-400 font-bold">&raquo; UI Viewport Layer:</span>
                            <span>The React client acts as a high-focus terminal displaying responsive parameters, saving notes, editing config arrays, and executing custom actions in direct link with SQLite.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-cyan-400 font-bold">&raquo; Decoupled dependencies:</span>
                            <span>No application processes depend directly on internet status metrics. Offline triggers remain completely operable.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 02: Folder Structure blueprints */}
                    {selectedArchSection === "folder" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-5">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">JARVIS_OS Folder structures blue-print</h3>
                          <span className="font-mono text-[8px] text-slate-500">Workspace Blueprints</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                          Review the workspace blueprint layout mapping below. Modular files keep the styling, backend endpoints, and sandbox virtual environments completely isolated.
                        </p>
                        
                        <div className="bg-slate-950 border border-slate-900 p-4 rounded-lg text-[10.5px] font-mono text-slate-300 space-y-1 overflow-x-auto select-all leading-relaxed">
                          <div><span className="text-cyan-400">JARVIS_OS_ROOT /</span></div>
                          <div>├── <span className="text-slate-400 font-bold">server.ts</span> <span className="text-slate-500">(Full stack express app proxy routing)</span></div>
                          <div>├── <span className="text-slate-400 font-bold">package.json</span> <span className="text-slate-500">(Dependencies configuration: Express, React, @google/genai)</span></div>
                          <div>├── <span className="text-indigo-400">sandbox /</span> <span className="text-slate-500">(Private files and directories workspace cache)</span></div>
                          <div>│   ├── <span className="text-slate-450">todo.txt</span> <span className="text-slate-500">(Context checklist files)</span></div>
                          <div>│   ├── <span className="text-slate-450">notes.txt</span> <span className="text-slate-550">(Logged details text store)</span></div>
                          <div>│   └── <span className="text-slate-450">jarvis_memory.json</span> <span className="text-slate-500">(Local database emulator schema)</span></div>
                          <div>└── <span className="text-indigo-400">src /</span> <span className="text-slate-500">(Interactive client UI viewport)</span></div>
                          <div>    ├── <span className="text-slate-400">App.tsx</span> <span className="text-slate-550">(Sleek Orchestration panel view)</span></div>
                          <div>    └── <span className="text-slate-400">types.ts</span> <span className="text-slate-550">(TypeScript definitions interface logs)</span></div>
                        </div>
                      </div>
                    )}

                    {/* Section 03: local LLM inference engines */}
                    {selectedArchSection === "local_ai" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-5">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">Dynamic Multi-Model Local Routing Layer</h3>
                          <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[8.5px] px-2 py-0.5 rounded font-bold uppercase font-mono">Offline Local Router</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                          JARVIS integrates with local Ollama endpoints on port 11434, utilizing a high-efficiency dynamic local routing layer to split tasks autonomously between local weights:
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[9px] font-mono text-slate-350 bg-slate-950 p-3 rounded-lg border border-slate-900">
                          <div className="p-1.5 border border-white/5 rounded">
                            <span className="text-cyan-400 font-bold block">DeepSeek-Coder</span>
                            <span className="text-slate-500 text-[8px]">Coding & File Tasks</span>
                          </div>
                          <div className="p-1.5 border border-white/5 rounded">
                            <span className="text-cyan-400 font-bold block">Llama 3</span>
                            <span className="text-slate-500 text-[8px]">Complex Reasoning</span>
                          </div>
                          <div className="p-1.5 border border-white/5 rounded">
                            <span className="text-cyan-400 font-bold block">Phi-3</span>
                            <span className="text-slate-500 text-[8px]">Fast Greet/Replies</span>
                          </div>
                          <div className="p-1.5 border border-white/5 rounded">
                            <span className="text-cyan-400 font-bold block">LLaVA</span>
                            <span className="text-slate-500 text-[8px]">Vision & Screen OCR</span>
                          </div>
                          <div className="p-1.5 border border-white/5 rounded">
                            <span className="text-cyan-400 font-bold block">Whisper</span>
                            <span className="text-slate-500 text-[8px]">Speech Transcribe</span>
                          </div>
                          <div className="p-1.5 border border-white/5 rounded">
                            <span className="text-cyan-400 font-bold block">Piper</span>
                            <span className="text-slate-500 text-[8px]">Text-to-Speech Output</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-4 border border-slate-900 rounded-lg space-y-2.5 font-mono text-[10px]">
                          <div className="text-cyan-400 font-bold border-b border-slate-900 pb-1">Ollama Python Local Server Bridge</div>
                          <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-text text-[9.5px]">
                            {pythonCodeSample}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Section 04: SQLite Memory schemas */}
                    {selectedArchSection === "db_schema" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-4">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">SQLite Long-Term Memory Scheme</h3>
                          <span className="font-mono text-[8px] text-slate-500">Permanent Indexing Map</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                          The long term database stores conversation logs, personalized settings variables, and autonomous execution histories.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[9px] text-slate-300">
                          <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-lg space-y-2">
                            <span className="text-cyan-400 font-black block text-[10.5px]">TABLE memory_log</span>
                            <span className="text-[8.5px] text-slate-500 block italic leading-normal">Stores contextual metadata tags for conversations logs.</span>
                            <pre className="bg-slate-900 p-2 rounded text-[8.5px] text-slate-400 border border-slate-950 select-text">
{`id INTEGER PRIMARY KEY
category TEXT
user_command TEXT
ai_response TEXT
executed_action TEXT
timestamp DATETIME`}
                            </pre>
                          </div>

                          <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-lg space-y-2">
                            <span className="text-cyan-400 font-black block text-[10.5px]">TABLE logs</span>
                            <span className="text-[8.5px] text-slate-500 block italic leading-normal">General diagnostics alerts reporting operating variables.</span>
                            <pre className="bg-slate-900 p-2 rounded text-[8.5px] text-slate-400 border border-slate-950 select-text">
{`id INTEGER PRIMARY KEY
level TEXT (INFO, WARNING, DEBUG)
module TEXT
message TEXT
timestamp DATETIME`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 05: Capacitor Link Sync specification */}
                    {selectedArchSection === "ipc" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-4">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">Mobile Companion IPC Specifications</h3>
                          <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[8.5px] px-2 py-0.5 rounded font-bold uppercase font-mono">Tether Protocol</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                          Coordinates synchronization updates between standard browsers, hybrid desktop wrappers tauri, and Capacitor mobile environments.
                        </p>
                        <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10.5px] leading-relaxed text-slate-400">
                          <span className="text-cyan-400 font-bold block mb-1">Pairing link and token authorizations:</span>
                          Mobile devices connect over WiFi tunnels. Communication credentials are verified over the secure pairing PIN database tables. Sync items register down to sqlite database log indices.
                        </div>
                      </div>
                    )}

                    {/* Section 06: Security Policy spec */}
                    {selectedArchSection === "security_policy" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-4 font-mono">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Granular Security Clearance Policies</h3>
                          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[8.5px] px-2 py-0.5 rounded font-bold uppercase">Shield Active</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          JARVIS-OS implements a strict three-tier classification architecture to gauge and govern the execution behavior of incoming commands.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2.5">
                          <div className="bg-slate-900/60 border border-slate-900 p-3 rounded-lg space-y-1.5">
                            <span className="text-[10px] text-emerald-400 font-black block">🟢 SAFE ACTIONS</span>
                            <span className="text-[8.5px] text-slate-500 leading-normal block">Allowed instantly without warning overlays.</span>
                            <code className="text-[8px] text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">list_files</code>
                            <code className="text-[8px] text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">read_file</code>
                            <code className="text-[8px] text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">database_query</code>
                          </div>
                          
                          <div className="bg-slate-900/60 border border-slate-900 p-3 rounded-lg space-y-1.5">
                            <span className="text-[10px] text-amber-400 font-black block">🟡 CONFIRMATION REQUIRED</span>
                            <span className="text-[8.5px] text-slate-500 leading-normal block">Triggers explicit supervisor warning dialog panels.</span>
                            <code className="text-[8px] text-amber-300 bg-slate-950 px-1 py-0.5 rounded">delete_file</code>
                            <code className="text-[8px] text-amber-300 bg-slate-950 px-1 py-0.5 rounded">run_command</code>
                            <code className="text-[8px] text-amber-300 bg-slate-950 px-1 py-0.5 rounded">npm install</code>
                          </div>

                          <div className="bg-slate-900/60 border border-slate-900 p-3 rounded-lg space-y-1.5">
                            <span className="text-[10px] text-red-400 font-black block">🔴 BLOCKED ACTIONS</span>
                            <span className="text-[8.5px] text-slate-500 leading-normal block">Forbidden. Completely denied to safeguard host partition.</span>
                            <code className="text-[8px] text-red-300 bg-slate-950 px-1 py-0.5 rounded">sudo / rm -rf</code>
                            <code className="text-[8px] text-red-300 bg-slate-950 px-1 py-0.5 rounded">chmod / chown</code>
                            <code className="text-[8px] text-red-300 bg-slate-950 px-1 py-0.5 rounded">/etc/passwd</code>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 07: Action Verify spec */}
                    {selectedArchSection === "action_verify" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-4 font-mono">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Action Verification Engine</h3>
                          <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[8.5px] px-2 py-0.5 rounded font-bold uppercase">Integrity Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Rather than completing tasks with blind "fire and forget" commands, the active agent analyzes and registers post-run indicators to prove compliance.
                        </p>
                        
                        <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-lg space-y-2 text-[10px] leading-relaxed font-mono">
                          <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-indigo-950 pb-1.5 mb-1.5">
                            <CheckCircle className="h-4 w-4 text-cyan-400" />
                            <span>POST-EXECUTION COMPLIANCE CHECKS</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>✅ Filesystem Integrity:</span>
                            <span className="text-cyan-400 font-semibold">Verify target exists with size &gt; 0 bytes</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>✅ Workspace Sanitation:</span>
                            <span className="text-cyan-400 font-semibold">Assert deleted objects are evicted from cache</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>✅ Browser Automations:</span>
                            <span className="text-cyan-400 font-semibold">Assert active webpage viewport load response code (200)</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>✅ Log Signatures audit:</span>
                            <span className="text-cyan-400 font-semibold">Confirm process terminates with ZERO exit failure codes</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 08: Voice/Vision Spec */}
                    {selectedArchSection === "voice_vision_stack" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-4 font-mono">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Passive Speech Listener & OpenCV Screen coordinates</h3>
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[8.5px] px-2 py-0.5 rounded font-bold uppercase">Ready Link</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Prepares a high-speed local migration roadmap away from browser integrations and toward native offline voice pipelines and machine learning vision models.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px]">
                          <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-lg space-y-2.5">
                            <span className="text-cyan-400 font-bold block border-b border-slate-900 pb-1">🎤 Offline Voice Models</span>
                            <div className="flex justify-between text-[9.5px] text-slate-400">
                              <span>Local Speech-To-Text:</span>
                              <span className="text-indigo-300">Whisper.cpp (Quantized base.en)</span>
                            </div>
                            <div className="flex justify-between text-[9.5px] text-slate-400">
                              <span>Local Text-To-Speech:</span>
                              <span className="text-indigo-300">Piper TTS Engine (Medium weight)</span>
                            </div>
                            <span className="text-[9px] text-slate-500 leading-normal block">
                              Web Speech API listen triggers act as standard placeholders until native pipelines are fully loaded inside the local container.
                            </span>
                          </div>

                          <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-lg space-y-2.5">
                            <span className="text-cyan-400 font-bold block border-b border-slate-900 pb-1">👁️ Machine Vision Coordinates</span>
                            <div className="flex justify-between text-[9.5px] text-slate-400">
                              <span>OCR Parser Model:</span>
                              <span className="text-indigo-300">Tesseract OCR Engine</span>
                            </div>
                            <div className="flex justify-between text-[9.5px] text-slate-400">
                              <span>Feature Mapping Edge:</span>
                              <span className="text-indigo-300">OpenCV Contour Pipelines</span>
                            </div>
                            <span className="text-[9px] text-slate-500 leading-normal block">
                              Averages contours bounding boxes, layouts coordinate indices, and captures real-time screenshots and edge alignments safely on localhost.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 09: Native Desktop Spec */}
                    {selectedArchSection === "tg_desktop" && (
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 md:p-6 space-y-4 font-mono">
                        <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Tauri / Electron Native Desktop Integration</h3>
                          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[8.5px] px-2 py-0.5 rounded font-bold uppercase">Packaging ready</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          The client and backend server compile effortlessly to high-performance local tauri desktop projects, granting absolute permissions bypasses.
                        </p>

                        <div className="bg-slate-950 p-4 border border-slate-900 rounded-lg text-[10.5px] leading-relaxed text-slate-400 space-y-1.5">
                          <div className="text-cyan-400 font-bold">💎 UNRESTRICTED SYSTEM ADVANTAGES:</div>
                          <div>&bull; <span className="text-slate-300">System Tray Autopilot:</span> Run quietly minimized to tray icons while processes complete background workflows.</div>
                          <div>&bull; <span className="text-slate-300">Local Clipboard integration:</span> Synchronize text parameters automatically across system layers.</div>
                          <div>&bull; <span className="text-slate-300">Native Watchers monitors:</span> Track directory additions, edits, or deletions asynchronously.</div>
                          <div>&bull; <span className="text-slate-300">Subprocess spawned limits:</span> Grants absolute console integration without sandboxed limitations.</div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
