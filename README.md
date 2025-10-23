# 桌面冒險者 - 透明桌面寵物 RPG

基於 Electron + Phaser 3 開發的跨平台透明桌面寵物遊戲。

## 技術棧

- **桌面框架**：Electron 38.4.0
- **遊戲引擎**：Phaser 3.90.0 (WebGL)
- **開發語言**：JavaScript (Node.js 22.x)
- **測試框架**：Vitest 3.2.4
- **打包工具**：electron-builder 26.1.0
- **目標平台**：Windows / macOS / Linux

## 專案結構

```
rpg-game/
├── src/
│   ├── audio/           # 音訊管理（AudioManager）
│   ├── core/            # 遊戲核心邏輯（GameState）
│   ├── scenes/          # Phaser 場景（DesktopScene）
│   ├── story/           # 故事系統（StoryManager）
│   └── ui/              # UI 管理（UIManager）
├── assets/              # 遊戲資源
│   ├── sprites/         # 精靈圖
│   ├── audio/           # 音效/音樂
│   └── icon.png         # 應用程式圖標
├── docs/                # 專案文檔
├── scripts/             # 開發腳本
├── tests/               # 測試文件
├── main.js              # Electron 主程序
├── game.js              # Phaser 遊戲入口
├── index.html           # 遊戲 HTML
└── package.json         # 專案配置
```

## 快速開始

### 前置需求

- **Node.js 22.x** - [安裝指南](docs/NODE_SETUP.md)
- **npm 10.x**
- Windows 10+ / macOS / Linux

### 安裝依賴

```bash
npm install
```

### 開發環境啟動

```bash
# 啟動遊戲
npm start

# 或使用腳本（含環境檢查）
./scripts/dev.sh
```

### 測試

```bash
# 運行測試
npm test

# 或使用腳本
./scripts/test.sh
```

### 打包

```bash
# 打包遊戲
./scripts/build.sh

# 會提示選擇平台：
# 1) Windows
# 2) macOS
# 3) Linux
# 4) 全部平台

# 打包文件會輸出到 dist/ 目錄
```

## 開發指南

### 添加新場景

1. 在 `src/scenes/` 創建新場景文件：

```javascript
// src/scenes/MapScene.js
class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
    }

    create() {
        // 場景邏輯
    }
}

module.exports = MapScene;
```

2. 在 `game.js` 中註冊場景：

```javascript
const MapScene = require('./src/scenes/MapScene');

const config = {
    // ...
    scene: [
        BootScene,
        BattleScene,
        MapScene  // 添加新場景
    ]
};
```

### 場景切換

```javascript
// 從當前場景切換到其他場景
this.scene.start('MapScene');

// 暫停當前場景並啟動另一個（用於 UI 覆蓋層）
this.scene.launch('InventoryScene');
```

### 載入資源

在 `BootScene.js` 的 `preload()` 方法中：

```javascript
preload() {
    // 圖片
    this.load.image('hero', 'assets/sprites/hero.png');

    // 精靈表（動畫用）
    this.load.spritesheet('hero-walk', 'assets/sprites/hero-walk.png', {
        frameWidth: 64,
        frameHeight: 64
    });

    // 音效
    this.load.audio('bgm', 'assets/audio/battle.mp3');
}
```

### 創建動畫

```javascript
// 在場景的 create() 中
this.anims.create({
    key: 'hero-walk-down',
    frames: this.anims.generateFrameNumbers('hero-walk', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
});

// 播放動畫
this.heroSprite.play('hero-walk-down');
```

## 開發指南

### 專案特色

- ✨ **透明桌面背景**：完全透明視窗，遊戲角色顯示在桌面上
- 📍 **右下角 UI**：可折疊的 RPG 介面，7個功能分頁
- 📖 **故事系統**：主線故事、角色故事、隨機事件
- 🎵 **音訊管理**：背景音樂、音效、音量控制
- 💾 **自動存檔**：localStorage 持久化

### 安裝新套件

```bash
npm install <package-name>
```

### 環境設定

詳見 [環境設定指南](docs/NODE_SETUP.md) 和 [WSL2 設定](docs/WSL2-SETUP.md)

### 故障排除

#### Node.js 版本問題

確保使用 Node.js 22.x：
```bash
node --version  # 應顯示 v22.x.x
```

#### 依賴安裝失敗

清理並重新安裝：
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 測試失敗

確保沒有語法錯誤：
```bash
npm test -- --reporter=verbose
```

## Steam 整合（待實作）

### 安裝 greenworks

```bash
npm install greenworks
```

### Steam API 範例

```javascript
const greenworks = require('greenworks');

// 初始化
if (greenworks.initAPI()) {
    console.log('Steam API 初始化成功');
}

// 解鎖成就
greenworks.activateAchievement('FIRST_VICTORY', () => {
    console.log('成就解鎖');
});

// 雲存檔
greenworks.saveTextToFile('save.json', data, () => {
    console.log('存檔上傳到 Steam 雲端');
});
```

## 測試

測試文件放在 `tests/` 目錄：

```javascript
// tests/battle.test.js
import { describe, it, expect } from 'vitest';

describe('戰鬥系統', () => {
    it('應該正確計算傷害', () => {
        const damage = calculateDamage(50, 20);
        expect(damage).toBeGreaterThan(0);
    });
});
```

運行測試：

```bash
./scripts/test.sh
```

## 目前功能

- ✅ Electron + Phaser 3 基礎架構
- ✅ Node.js 原生開發環境
- ✅ 戰鬥場景 prototype
  - 回合制戰鬥
  - 血條系統
  - 攻擊/技能按鈕
  - 動畫效果
  - 傷害顯示
- ✅ 跨平台打包配置

## 待實作功能

- [ ] 遊戲核心邏輯
  - [ ] 角色系統
  - [ ] 養成系統
  - [ ] 存檔系統
- [ ] 劇情系統
  - [ ] 對話場景
  - [ ] 分支選擇
  - [ ] 劇情管理
- [ ] 地圖系統
  - [ ] 地圖場景
  - [ ] 角色移動
  - [ ] 場景切換
- [ ] Steam 整合
  - [ ] Steamworks API
  - [ ] 成就系統
  - [ ] 雲存檔
  - [ ] DRM 保護

## License

MIT
