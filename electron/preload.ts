const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  runCommand: (cmd) => ipcRenderer.invoke("run-command", cmd),
  onSystemEvent: (callback) => ipcRenderer.on("system-event", (_event, value) => callback(value)),
});
