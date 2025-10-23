const { app, BrowserWindow } = require('electron');
const path = require('path');

// 開發模式檢測
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--watch');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // 在 Docker 中需要禁用沙箱
      sandbox: false
    },
    // 遊戲視窗設定
    resizable: true,
    fullscreenable: true,
    title: 'RPG Game'
  });

  // 載入遊戲頁面
  mainWindow.loadFile('index.html');

  // 開發模式開啟 DevTools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 視窗關閉事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 錯誤處理
  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.warn('Renderer process unresponsive');
  });
}

// Electron 就緒後創建視窗
app.whenReady().then(() => {
  createWindow();

  // macOS 特定行為
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有視窗關閉時退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 處理未捕獲的異常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

console.log('Electron app started');
console.log('Platform:', process.platform);
console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);
