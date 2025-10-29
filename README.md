# 悅來客棧 - 治癒系客棧經營管理遊戲

基於 **Phaser 3** 遊戲引擎開發的輕度經營管理遊戲，支援瀏覽器開發與桌面打包。

## 遊戲簡介

在這個治癒系的南宋客棧經營遊戲中，你將扮演一位客棧主人，經營一家名為「悅來客棧」的小店。招募夥伴、管理資源、接待客人、處理各種隨機事件，見證一個個失敗者的重生物語。

### 核心特色

- 🏮 **經營管理**：客棧升級、資源管理、財務平衡
- 👥 **角色養成**：招募夥伴、培養能力、提升好感度
- 📖 **視覺小說**：豐富劇情、分支選擇、角色故事
- ⏰ **時間系統**：日夜循環、季節變化、每日結算
- 🎯 **派遣系統**：押鏢、行商、探索、採集任務
- 💰 **貿易系統**：動態市場、季節商品、價格波動
- 🌸 **治癒調性**：溫暖畫風、舒緩音樂、正向主題

## 快速開始

### 前置需求

- **Node.js 22.x** - [安裝指南](docs/NODE_SETUP.md)
- **npm 10.x**
- 現代瀏覽器（Chrome/Firefox/Edge）或 Windows 10+ / macOS / Linux

### 安裝依賴

```bash
npm install
```

### 三種開發模式

#### 1. 瀏覽器開發模式（推薦）

```bash
npm run start:web
```

- ✅ 無需 Electron，直接在瀏覽器測試
- ✅ 開發者工具完整功能（F12）
- ✅ 熱重載（手動重新整理頁面）
- ✅ 跨平台（Windows/Mac/Linux）
- 🌐 訪問：http://localhost:8080

#### 2. Electron 桌面模式

```bash
npm start

# 如果是 WSL2 環境
npm run start:wsl
```

- 標準遊戲視窗（1280×720）
- F11 切換全螢幕
- 自動打開 DevTools（開發模式）

#### 3. 打包版執行檔

```bash
# Windows 快速打包
./scripts/package-win.sh

# 或完整打包（含測試）
./scripts/build-windows.sh
```

打包後執行 `dist/悅來客棧-0.2.0-portable.exe`

## 專案結構

```
rpg-game/
├── src/
│   ├── core/
│   │   └── GameState.js           # 遊戲核心狀態管理
│   ├── managers/                   # 19個功能管理器
│   │   ├── AffectionManager.js    # 好感度系統
│   │   ├── AudioManager.js        # 音訊管理
│   │   ├── DailyOperationManager.js  # 每日營運
│   │   ├── EquipmentManager.js    # 裝備系統
│   │   ├── EventManager.js        # 事件系統
│   │   ├── GameFlowManager.js     # 遊戲流程控制
│   │   ├── InnManager.js          # 客棧管理
│   │   ├── InventoryManager.js    # 背包系統
│   │   ├── LearningManager.js     # 學習系統
│   │   ├── MissionManager.js      # 派遣系統
│   │   ├── NotificationManager.js # 通知系統
│   │   ├── SaveLoadManager.js     # 存檔系統
│   │   ├── SeasonManager.js       # 季節系統
│   │   ├── StoryManager.js        # 故事系統
│   │   ├── TaskManager.js         # 任務管理
│   │   ├── TechnologyManager.js   # 科技樹
│   │   ├── TimeManager.js         # 時間系統
│   │   ├── TradeManager.js        # 貿易系統
│   │   └── UIManager.js           # UI 管理
│   ├── scenes/                     # Phaser 場景
│   │   ├── BootScene.js           # 啟動場景
│   │   ├── MainMenuScene.js       # 主選單
│   │   ├── SettingsScene.js       # 設定頁面
│   │   ├── LoadGameScene.js       # 讀檔頁面
│   │   ├── StoryScene.js          # 視覺小說場景
│   │   ├── DesktopScene.js        # 桌面場景
│   │   ├── ExteriorScene.js       # 客棧外觀
│   │   ├── LobbyScene.js          # 大廳場景
│   │   ├── KitchenScene.js        # 廚房場景
│   │   ├── StorageScene.js        # 儲藏室場景
│   │   ├── RoomAScene.js          # 客房A
│   │   └── RoomBScene.js          # 客房B
│   └── utils/                      # 工具函式
│       ├── AssetManager.js        # 資源管理
│       ├── DialogFactory.js       # 對話框工廠
│       ├── helpers.js             # 輔助函式
│       └── InventoryHelpers.js    # 背包輔助
├── assets/                         # 遊戲資源（954個文件）
│   ├── audio/                      # 音效與 BGM
│   ├── sprites/                    # 角色與物品圖像
│   ├── ui/                         # UI 元素
│   └── scenes/                     # 場景背景
├── docs/                           # 專案文檔
│   ├── 核心設計/                   # 遊戲設計文檔
│   ├── 開發指南/                   # 開發教學
│   └── 技術文檔/                   # 技術規格
├── scripts/                        # 開發腳本
│   ├── start-web-server.js        # 瀏覽器開發伺服器
│   ├── dev.sh                     # 開發環境啟動
│   ├── test.sh                    # 測試執行
│   ├── build.sh                   # 打包腳本
│   └── generate-*.js              # 資源生成腳本
├── tests/                          # 測試文件（1173個測試）
├── main.js                         # Electron 主程序
├── game.js                         # Phaser 遊戲入口
├── index.html                      # 遊戲 HTML
└── package.json                    # 專案配置
```

## 遊戲系統

### 核心系統（已實作）

1. **GameState** - 遊戲核心狀態管理
2. **TimeManager** - 時間系統（日夜循環、每日結算）
3. **SeasonManager** - 季節系統（四季變化、季節效果）
4. **StoryManager** - 故事系統（視覺小說、分支劇情）
5. **EventManager** - 事件系統（隨機事件、條件觸發）
6. **NotificationManager** - 通知系統（消息推送）
7. **AffectionManager** - 好感度系統（角色關係）
8. **LearningManager** - 學習系統（技能學習）
9. **InventoryManager** - 背包系統（物品管理）
10. **EquipmentManager** - 裝備系統（裝備管理）
11. **AudioManager** - 音訊管理（BGM、音效）
12. **UIManager** - UI 管理（介面控制）
13. **SaveLoadManager** - 存檔系統（localStorage）
14. **DailyOperationManager** - 每日營運（營業結算）
15. **GameFlowManager** - 遊戲流程控制
16. **InnManager** - 客棧管理（建築、房間）
17. **TaskManager** - 任務管理（日常任務）

### 待實作系統

18. **MissionManager** - 派遣系統（押鏢、行商、探索）
19. **TradeManager** - 貿易系統（市場交易、價格波動）
20. **TechnologyManager** - 科技樹（建築升級、新設施）

## 測試

### 運行測試

```bash
npm test
```

### 測試統計

- **總測試數**：1173 個測試
- **測試覆蓋率**：83.69%
- **測試框架**：Vitest 4.0.3
- **覆蓋率工具**：c8 (v8 provider)

### 查看覆蓋率報告

```bash
npm test
# 打開 coverage/index.html
```

## 開發指南

### 添加新場景

1. 在 `src/scenes/` 創建新場景：

```javascript
// src/scenes/NewScene.js
class NewScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NewScene' });
    }

    preload() {
        // 載入資源
    }

    create() {
        // 場景邏輯
    }
}

module.exports = NewScene;
```

2. 在 `game.js` 中註冊：

```javascript
const NewScene = require('./src/scenes/NewScene');

const config = {
    scene: [
        BootScene,
        MainMenuScene,
        NewScene  // 添加新場景
    ]
};
```

3. 場景切換：

```javascript
this.scene.start('NewScene');  // 切換到新場景
this.scene.launch('UIScene');  // 並行運行（UI 覆蓋層）
```

### 使用管理器

所有管理器都通過 `GameState` 訪問：

```javascript
// 在場景中
const gameState = this.registry.get('gameState');

// 訪問各個管理器
gameState.timeManager.advanceDay();
gameState.inventoryManager.addItem('food_rice', 10);
gameState.affectionManager.modifyAffection('employee1', 5);
gameState.storyManager.startStory('story_001');
```

### 添加新管理器

1. 創建管理器文件：

```javascript
// src/managers/NewManager.js
class NewManager {
    constructor(gameState) {
        this.gameState = gameState;
        // 初始化
    }

    // 管理器方法
}

module.exports = NewManager;
```

2. 在 `GameState.js` 中整合：

```javascript
const NewManager = require('../managers/NewManager');

class GameState {
    constructor() {
        // ...
        this.newManager = new NewManager(this);
    }
}
```

### 資源管理

在 `BootScene.preload()` 中載入資源：

```javascript
preload() {
    // 圖片
    this.load.image('hero', 'assets/sprites/hero.png');

    // 精靈表（動畫）
    this.load.spritesheet('hero-walk', 'assets/sprites/hero-walk.png', {
        frameWidth: 64,
        frameHeight: 64
    });

    // 音訊
    this.load.audio('bgm', 'assets/audio/bgm/main-menu.mp3');
}
```

### 存檔與讀檔

```javascript
// 存檔
gameState.saveLoadManager.saveGame();

// 讀檔
const saveData = gameState.saveLoadManager.loadGame();
if (saveData) {
    gameState.loadFromSave(saveData);
}
```

## 文檔

- [遊戲概述](docs/核心設計/GAME_OVERVIEW.md) - 遊戲設計理念與核心玩法
- [系統設計](docs/核心設計/SYSTEM_DESIGN.md) - 各系統詳細設計
- [技術架構](docs/核心設計/TECHNICAL_ARCHITECTURE.md) - 技術架構與實作細節
- [快速開始](docs/開發指南/QUICK_START.md) - 新手上手指南
- [場景系統](docs/開發指南/SCENE_GUIDE.md) - Phaser 場景開發指南
- [測試指南](docs/開發指南/TESTING_GUIDE.md) - 測試編寫與執行

## 技術棧

- **遊戲引擎**：Phaser 3.90.0 (WebGL)
- **桌面框架**：Electron 38.3.0（可選）
- **開發語言**：JavaScript (Node.js 22.x)
- **測試框架**：Vitest 4.0.3
- **打包工具**：electron-builder 26.1.0
- **目標平台**：Web 瀏覽器 / Windows / macOS / Linux

## 開發狀態

### v0.2.0（當前版本）

**主要變更**：從桌面寵物遊戲轉型為經營管理遊戲

- ✅ 重新定位：經營管理模擬 + 角色養成 + 視覺小說
- ✅ 瀏覽器開發模式支援（`npm run start:web`）
- ✅ 標準遊戲視窗（1280×720，16:9 比例）
- ✅ 響應式設計（Phaser.Scale.FIT）
- ✅ 移除桌面寵物特性（透明視窗、置頂等）
- ✅ 主選單背景音樂（Quiet Lantern Glow）
- ✅ 完整的 19 個管理器系統
- ✅ 954 個遊戲資源文件
- ✅ 1173 個測試（83.69% 覆蓋率）

### 下一步計劃（v0.3.0）

- [ ] 實作 MissionManager（派遣系統）
- [ ] 實作 TradeManager（貿易系統）
- [ ] 實作 TechnologyManager（科技樹）
- [ ] 完整的客棧場景 UI
- [ ] 更多角色與劇情

## 故障排除

### Node.js 版本問題

確保使用 Node.js 22.x：

```bash
node --version  # 應顯示 v22.x.x
```

如果版本不對，參考 [Node.js 設定指南](docs/NODE_SETUP.md)

### 依賴安裝失敗

清理並重新安裝：

```bash
rm -rf node_modules package-lock.json
npm install
```

### WSL2 GPU 錯誤

在 WSL2 環境使用特殊啟動命令：

```bash
npm run start:wsl
```

或直接使用瀏覽器開發模式：

```bash
npm run start:web
```

### 測試失敗

查看詳細錯誤信息：

```bash
npm test -- --reporter=verbose
```

## 更新日誌

### v0.2.0 (2025-01-XX)

**重大變更**：
- 遊戲定位從「桌面寵物」轉型為「經營管理遊戲」
- 新增瀏覽器開發模式支援
- 視窗從小視窗（300×400）改為標準遊戲視窗（1280×720）
- 移除透明背景、置頂等桌面寵物特性
- 更新專案名稱為「悅來客棧」

**新增功能**：
- 主選單背景音樂
- `npm run start:web` 瀏覽器開發命令
- 19 個完整的管理器系統
- 954 個遊戲資源文件
- 1173 個單元測試（83.69% 覆蓋率）
- F11 全螢幕切換快捷鍵
- 標準視窗控制（最小化、最大化、關閉）

**文檔更新**：
- 更新 GAME_OVERVIEW.md（v3→v4 演化）
- 更新 SYSTEM_DESIGN.md
- 更新 TECHNICAL_ARCHITECTURE.md
- 新增 README.md

### v0.1.0 (2025-01-XX)

- 初始版本
- Electron + Phaser 3 基礎架構
- 桌面寵物原型

## License

MIT

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 聯絡方式

- GitHub: [專案連結]
- Email: [聯絡信箱]
