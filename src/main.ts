import { BrowserWindow } from "electrobun/bun";
import { app, ipcMain } from "electrobun/bun";

let mainWindow: BrowserWindow | null = null;
let isVisible = false;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    transparent: true,
    frame: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: "src/view/preload.ts",
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL("views://mainview/index.html");

  // Toggle window visibility
  ipcMain.on("toggle-window", () => {
    if (!mainWindow) return;
    
    if (isVisible) {
      mainWindow.hide();
      isVisible = false;
    } else {
      mainWindow.show();
      mainWindow.focus();
      isVisible = true;
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  app.quit();
});