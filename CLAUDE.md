# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個基於 **Electron + Phaser 3** 的跨平台透明桌面寵物 RPG 遊戲。目標平台包括 Windows、macOS、Linux 和 Steam。

## 關鍵技術架構

### 雙層架構模式
- **Electron 層** (`main.js`): 負責桌面應用視窗管理、系統整合
- **Phaser 3 層** (`game.js` + `src/scenes/`): 遊戲引擎邏輯、場景渲染

### 場景系統
Phaser 使用場景（Scene）作為遊戲的基本組織單位：

1. **BootScene** (`src/scenes/BootScene.js`): 資源載入與初始化
   - 負責所有 `preload()` 資源載入
   - 創建載入進度條 UI
   - 完成後自動切換到第一個遊戲場景

2. **BattleScene** (`src/scenes/BattleScene.js`): 回合制戰鬥場景
   - 使用 Phaser.Tweens 實現動畫系統
   - 自包含角色物件結構（sprite、HP、動畫方法）
   - UI 透過 `disableUI()`/`enableUI()` 控制回合邏輯

3. **添加新場景流程**:
   ```javascript
   // 1. 在 src/scenes/ 創建新場景
   class MapScene extends Phaser.Scene {
       constructor() { super({ key: 'MapScene' }); }
   }

   // 2. 在 game.js 中註冊
   scene: [BootScene, BattleScene, MapScene]

   // 3. 場景切換
   this.scene.start('MapScene');  // 停止當前場景並啟動新場景
   this.scene.launch('UIScene');  // 並行運行場景（用於 UI 覆蓋層）
   ```

### 全局狀態管理
`game.js` 中的 `window.gameState` 提供跨場景數據共享：
```javascript
window.gameState = {
    currentScene: null,
    player: null,
    settings: { volume: 1.0, language: 'zh-TW' }
};
```

## 常用開發命令

### 安裝依賴
```bash
npm install
```

### 啟動開發環境
```bash
npm start
# 或使用開發腳本
./scripts/dev.sh
```
- 啟動 Electron 應用
- 自動打開 DevTools
- 支持熱重載

### 測試
```bash
npm test
# 或使用腳本
./scripts/test.sh
```
- 使用 Vitest 框架
- 配置位於 `vitest.config.js`
- 測試文件放在 `tests/` 目錄，命名為 `*.test.js`

### 打包遊戲

**快速打包 Windows 版本：**
```bash
./scripts/package-win.sh
```

**完整打包（含測試）：**
```bash
./scripts/build-windows.sh
```

**其他平台：**
```bash
./scripts/build.sh
```
- 會提示選擇平台（Windows/macOS/Linux/全部）
- 使用 electron-builder
- 輸出到 `dist/` 目錄

### 安裝新套件
```bash
npm install <package-name>
```

## 開發注意事項

### Phaser 資源載入
所有資源必須在 `BootScene.preload()` 中載入：
```javascript
preload() {
    this.load.image('hero', 'assets/sprites/hero.png');
    this.load.spritesheet('hero-walk', 'assets/sprites/hero-walk.png', {
        frameWidth: 64, frameHeight: 64
    });
    this.load.audio('bgm', 'assets/audio/battle.mp3');
}
```

### Electron 安全設定
`main.js` 中的安全配置：
```javascript
webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
}
```
**注意**：這些設定為開發便利性而設置，生產環境打包時應重新評估安全性需求。

### 場景間通信
避免使用全局變數，優先使用 Phaser 的 Registry 系統：
```javascript
// 儲存資料
this.registry.set('playerHP', 100);

// 讀取資料
const hp = this.registry.get('playerHP');

// 監聽變化
this.registry.events.on('changedata-playerHP', (parent, value) => {
    console.log('HP changed:', value);
});
```

### 測試覆蓋
配置位於 `vitest.config.js`：
- 使用 v8 provider 生成覆蓋率報告
- 排除 `node_modules/`、`tests/`、`dist/`
- 運行測試後查看 `coverage/index.html`

## 未來整合計劃

### Steam 整合（待實作）
需要安裝 `greenworks` 套件並處理：
- Steamworks API 初始化
- 成就系統
- 雲存檔同步
- DRM 保護

範例初始化流程：
```javascript
const greenworks = require('greenworks');
if (greenworks.initAPI()) {
    greenworks.activateAchievement('FIRST_VICTORY', callback);
}
```

## 故障排除

### Node.js 版本問題
確保使用 Node.js 22.x：
```bash
node --version  # 應顯示 v22.x.x
```

如果版本不對，請參考 [docs/NODE_SETUP.md](docs/NODE_SETUP.md)

### 依賴安裝失敗
清理並重新安裝：
```bash
rm -rf node_modules package-lock.json
npm install
```

### 測試失敗
查看詳細錯誤信息：
```bash
npm test -- --reporter=verbose
```

### 打包失敗
確保已安裝必要工具：
- **Windows**: 需要 Wine（在 Linux/WSL2 上打包 Windows 版本時）
- **macOS**: 需要在 macOS 上打包
- **Linux**: 需要相應的構建工具
