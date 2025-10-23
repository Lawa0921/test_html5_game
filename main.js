const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// 開發模式檢測
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--watch');

let mainWindow;
let clickCount = 0;
let keyPressCount = 0;

// 視窗尺寸配置
const WINDOW_SIZES = {
  small: { width: 300, height: 400 },   // 桌寵模式
  large: { width: 900, height: 650 }    // UI 展開模式
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_SIZES.small.width,
    height: WINDOW_SIZES.small.height,
    // 透明視窗配置
    transparent: true,
    frame: false,  // 無邊框
    alwaysOnTop: true,  // 桌寵模式應該置頂
    hasShadow: false,  // 無陰影
    resizable: false,  // 不可調整大小（由程式控制）
    skipTaskbar: true,  // 不顯示在任務欄（更像桌寵）

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    },
  });

  // 載入遊戲頁面
  mainWindow.loadFile('index-v2.html');

  // 開發模式開啟 DevTools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 設定視窗可以拖曳（透過特定區域）
  // mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // 視窗關閉事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 註冊全局快捷鍵
  registerGlobalShortcuts();

  // 設定 IPC 通信
  setupIPC();
}

function registerGlobalShortcuts() {
  // Ctrl+Shift+D 顯示/隱藏遊戲視窗
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  // Ctrl+Shift+Q 退出遊戲
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.quit();
  });
}

function setupIPC() {
  // 接收渲染進程的點擊事件
  ipcMain.on('user-click', () => {
    clickCount++;
    // 通知渲染進程更新銀兩
    if (mainWindow) {
      mainWindow.webContents.send('silver-earned', {
        amount: 1,
        type: 'click',
        total: clickCount
      });
    }
  });

  // 接收渲染進程的按鍵事件
  ipcMain.on('user-keypress', () => {
    keyPressCount++;
    if (mainWindow) {
      mainWindow.webContents.send('silver-earned', {
        amount: 1,
        type: 'keypress',
        total: keyPressCount
      });
    }
  });

  // 設定視窗穿透區域
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    if (mainWindow) {
      mainWindow.setIgnoreMouseEvents(ignore, options);
    }
  });

  // 最小化視窗
  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  // 關閉視窗
  ipcMain.on('close-window', () => {
    app.quit();
  });

  // 遊戲內關閉按鈕
  ipcMain.on('quit-game', () => {
    app.quit();
  });

  // 切換視窗大小（UI 展開/收起）
  ipcMain.on('toggle-window-size', (event, mode) => {
    if (mainWindow) {
      const size = mode === 'large' ? WINDOW_SIZES.large : WINDOW_SIZES.small;
      mainWindow.setSize(size.width, size.height, true);  // true = 動畫

      // UI 展開時顯示在任務欄，收起時隱藏
      mainWindow.setSkipTaskbar(mode !== 'large');

      // 通知渲染進程視窗大小已改變
      mainWindow.webContents.send('window-size-changed', { mode, ...size });
    }
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

// 應用退出前清理
app.on('will-quit', () => {
  // 取消所有全局快捷鍵
  globalShortcut.unregisterAll();
});

// 處理未捕獲的異常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

console.log('Desktop RPG started');
console.log('Platform:', process.platform);
console.log('Transparent window enabled');
console.log('');
console.log('快捷鍵:');
console.log('  Ctrl+Shift+D - 顯示/隱藏遊戲視窗');
console.log('  Ctrl+Shift+Q - 退出遊戲');
