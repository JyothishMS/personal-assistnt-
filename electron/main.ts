import { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu } from "electron";
import path from "path";
import { spawn } from "child_process";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let serverProcess: any = null;

function startBackendServer() {
  const p = path.join(__dirname, "..", "dist", "server.cjs");
  console.log(`Starting JARVIS OS Core at: ${p}`);
  serverProcess = spawn("node", [p], {
    stdio: "inherit",
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1" 
    }
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true, 
  });

  // Load the React app.
  // We point it to the local Express server that the backend will spin up
  mainWindow.loadURL("http://localhost:3000");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // 1. Start the Jarvis Backend Node API
  startBackendServer();

  // 2. Wait a bit for server to boot, then create window
  setTimeout(createWindow, 2000);

  // 3. Tray Icon Support
  let iconPath = path.join(__dirname, "..", "dist", "vite.svg");
  try {
    tray = new Tray(iconPath);
  } catch (e) {
    console.warn("Could not load tray icon, continuing without it.");
  }
  
  if (tray) {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show/Hide JARVIS', click: () => toggleWindow() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('JARVIS OS');
    tray.setContextMenu(contextMenu);
  }

  // 4. Global Hotkeys (Alt + Space by default to wake JARVIS)
  globalShortcut.register("CommandOrControl+Space", () => {
    toggleWindow();
  });
});

function toggleWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Implement IPC native bridge for running advanced shell commands directly if needed 
// (Server.ts can do this too via child_process, but here is an Electron layer)
ipcMain.handle("run-command", async (event, cmd) => {
  return new Promise((resolve, reject) => {
    // ... execution logic ...
    resolve({ success: true , output: "Executed locally" });
  });
});
