const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// 啟用 GPU 加速（Windows 原生環境優化）
if (process.platform === 'win32') {
  // 強制啟用硬體加速
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
  app.commandLine.appendSwitch('enable-accelerated-video-decode');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('enable-features', 'VulkanFromANGLE');

  // 禁用 GPU 沙盒以避免權限問題
  app.commandLine.appendSwitch('disable-gpu-sandbox');

  console.log('🎮 已啟用 GPU 硬體加速 (Windows 原生環境)');
}

// 開發模式檢測
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--watch');

let mainWindow;

// 支援的解析度配置
const SUPPORTED_RESOLUTIONS = {
  '1920x1080': { width: 1920, height: 1080 },
  '1600x900': { width: 1600, height: 900 },
  '1366x768': { width: 1366, height: 768 },
  '1280x720': { width: 1280, height: 720 },
  '1024x768': { width: 1024, height: 768 },
  '800x600': { width: 800, height: 600 }
};

// 最小視窗尺寸
const MIN_WINDOW = {
  width: 800,
  height: 600
};

// 載入設定（從 localStorage 讀取，如果沒有則使用預設值）
function loadSettings() {
  try {
    // 注意：這裡無法直接訪問 renderer 的 localStorage
    // 所以使用預設值，實際設定會在視窗創建後由 renderer 通知
    return {
      resolution: '1920x1080',
      fullscreen: false
    };
  } catch (error) {
    console.error('載入設定失敗：', error);
    return {
      resolution: '1920x1080',
      fullscreen: false
    };
  }
}

function createWindow() {
  // 載入設定
  const settings = loadSettings();
  const resolution = SUPPORTED_RESOLUTIONS[settings.resolution] || SUPPORTED_RESOLUTIONS['1920x1080'];

  mainWindow = new BrowserWindow({
    width: resolution.width,
    height: resolution.height,
    minWidth: MIN_WINDOW.width,
    minHeight: MIN_WINDOW.height,
    // 標準遊戲視窗配置
    backgroundColor: '#2e2e2e',
    frame: true,  // 顯示邊框
    resizable: true,  // 可調整大小
    center: true,  // 置中顯示
    fullscreen: settings.fullscreen,  // 根據設定決定是否全螢幕

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      enablePreferredSizeMode: false,
      // 確保啟用硬體加速
      hardwareAcceleration: true,
      webgl: true
    },
  });

  // 載入遊戲頁面
  mainWindow.loadFile('index.html');

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
  // F11 全螢幕切換
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  // Ctrl+Q 退出遊戲（macOS 風格）
  if (process.platform === 'darwin') {
    globalShortcut.register('CommandOrControl+Q', () => {
      app.quit();
    });
  }
}

function setupIPC() {
  // 最小化視窗
  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  // 最大化/還原視窗
  ipcMain.on('maximize-window', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  // 關閉視窗
  ipcMain.on('close-window', () => {
    app.quit();
  });

  // 全螢幕切換
  ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
      // 通知 renderer 全螢幕狀態已變更
      mainWindow.webContents.send('fullscreen-changed', !isFullScreen);
    }
  });

  // 設定全螢幕（由設定介面調用）
  ipcMain.on('set-fullscreen', (event, fullscreen) => {
    if (mainWindow) {
      mainWindow.setFullScreen(fullscreen);
      // 通知 renderer 全螢幕狀態已變更
      mainWindow.webContents.send('fullscreen-changed', fullscreen);
    }
  });

  // 切換解析度
  ipcMain.on('set-resolution', (event, resolution) => {
    if (mainWindow && SUPPORTED_RESOLUTIONS[resolution]) {
      const { width, height } = SUPPORTED_RESOLUTIONS[resolution];

      // 如果當前是全螢幕模式，先退出全螢幕
      const wasFullScreen = mainWindow.isFullScreen();
      if (wasFullScreen) {
        mainWindow.setFullScreen(false);
      }

      // 設定新的視窗大小
      mainWindow.setSize(width, height);
      mainWindow.center();

      // 通知 renderer 解析度已變更
      mainWindow.webContents.send('resolution-changed', resolution, width, height);

      console.log(`✅ 解析度已切換至: ${resolution}`);
    } else {
      console.error(`❌ 不支援的解析度: ${resolution}`);
    }
  });

  // 獲取當前視窗資訊
  ipcMain.handle('get-window-info', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      return {
        width: bounds.width,
        height: bounds.height,
        isFullScreen: mainWindow.isFullScreen(),
        isMaximized: mainWindow.isMaximized()
      };
    }
    return null;
  });
}

// Electron 就緒後創建視窗
app.whenReady().then(() => {
  // 輸出 GPU 狀態資訊
  const gpuInfo = app.getGPUFeatureStatus();
  console.log('\n=== Electron GPU 狀態 ===');
  console.log('GPU Compositing:', gpuInfo.gpu_compositing);
  console.log('2D Canvas:', gpuInfo['2d_canvas']);
  console.log('WebGL:', gpuInfo.webgl);
  console.log('Video Decode:', gpuInfo.video_decode);
  console.log('Rasterization:', gpuInfo.rasterization);
  console.log('');
  console.log('💡 注意：即使 Electron 報告 GPU 為 disabled，');
  console.log('   Phaser 遊戲引擎仍可能使用 WebGL 硬體加速。');
  console.log('   請查看遊戲啟動後的「渲染器」資訊。');
  console.log('');

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

console.log('🏮 悅來客棧 - 治癒系客棧經營遊戲');
console.log('Platform:', process.platform);
console.log('Game Mode: Management Simulation');
console.log('');
console.log('快捷鍵:');
console.log('  F11 - 全螢幕切換');
if (process.platform === 'darwin') {
  console.log('  Cmd+Q - 退出遊戲');
}
console.log('');
