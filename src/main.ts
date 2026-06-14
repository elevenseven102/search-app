import { BrowserWindow, app } from "electrobun";

let mainWindow: BrowserWindow | null = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    show: false,
  });

  mainWindow.loadURL("views://mainview/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  app.on("window-all-closed", () => {
    app.quit();
  });
});

// Handle Ctrl+Q globally
process.on("message", (msg: any) => {
  if (msg?.type === "toggle-window" && mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }
});
