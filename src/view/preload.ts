import { contextBridge, ipcRenderer } from "electrobun/view";

contextBridge.exposeInMainWorld("api", {
  toggleWindow: () => {
    ipcRenderer.send("toggle-window");
  },
});