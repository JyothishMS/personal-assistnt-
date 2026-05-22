export interface SandboxFile {
  name: string;
  size: number;
  updated_at: string;
  is_directory: boolean;
  type: string;
}

export interface ProcessMetrics {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: "sleeping" | "loaded" | "listening" | "ready" | "monitoring" | "running";
}

export interface TelemetryStats {
  osName: string;
  coreVersion: string;
  uptime: number;
  cpuUsage: number;
  ramUsage: number;
  ramTotal: number;
  sandboxFiles: number;
  sqliteDbSize: number;
  securityShield: string;
  yaraScanner: string;
  localModel: string;
  ollamaStatus: "ONLINE" | "OFFLINE";
  processes: ProcessMetrics[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "jarvis" | "system" | "security";
  text: string;
  timestamp: string;
  intent?: string;
  reasoning?: string;
  recommendedCmd?: string;
  isDangerous?: boolean;
  pendingApproval?: boolean;
  executionResponse?: string;
  sqliteDbCommand?: string;
  providersUsed?: string[];
  taskType?: string;
}

export interface MemoryLogRecord {
  id: number;
  timestamp: string;
  category: string;
  user_command: string;
  ai_response: string;
  executed_action: string;
}

export interface DatabaseState {
  sessions: Array<{ id: string; title: string; created_at: string }>;
  memory: Array<{ id: number; category: string; key_name: string; value_data: string; timestamp: string }>;
  tasks: Array<{ id: number; title: string; status: "completed" | "pending"; created_at: string; completed_at: string | null }>;
  logs: Array<{ id: number; level: "INFO" | "WARNING" | "DEBUG"; module: string; message: string; timestamp: string }>;
}
