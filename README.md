# RPG Game - 2D 劇情養成 RPG

基於 Electron + Phaser 3 開發的跨平台 2D RPG 遊戲。

## 技術棧

- **桌面框架**：Electron
- **遊戲引擎**：Phaser 3 (WebGL)
- **開發環境**：Docker（零污染本機環境）
- **測試框架**：Vitest
- **目標平台**：Windows / macOS / Linux / Steam

## 專案結構

```
rpg-game/
├── src/
│   ├── scenes/          # Phaser 遊戲場景
│   │   ├── BootScene.js       # 啟動/載入場景
│   │   └── BattleScene.js     # 戰鬥場景
│   ├── core/            # 遊戲邏輯（待實作）
│   └── steam/           # Steam API（待實作）
├── assets/              # 遊戲資源
│   ├── sprites/         # 精靈圖
│   └── audio/           # 音效/音樂
├── tests/               # 測試文件
├── main.js              # Electron 主程序
├── game.js              # Phaser 遊戲入口
├── index.html           # 遊戲 HTML
├── Dockerfile           # Docker 配置
├── docker-compose.yml   # Docker Compose 配置
└── package.json         # 專案配置
```

## 快速開始

### 前置需求

- Docker 和 Docker Compose
- X11 支持（Linux/macOS 需要）

### 開發環境啟動

```bash
# 啟動開發環境（會自動構建 Docker 映像）
./dev.sh
```

第一次運行會：
1. 構建 Docker 映像（約 2-5 分鐘）
2. 安裝 npm 依賴
3. 啟動 Electron 應用

之後運行只需幾秒鐘。

### 測試

```bash
# 運行測試
./test.sh
```

### 打包

```bash
# 打包遊戲
./build.sh

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

## Docker 環境說明

### 為什麼用 Docker？

1. **零污染**：不會在本機安裝 Node.js、Electron 等依賴
2. **一致性**：所有開發者使用相同的環境
3. **易分享**：新成員只需 `./dev.sh` 即可開始開發
4. **CI/CD 友善**：打包環境完全可重現

### 容器內部操作

```bash
# 進入容器 shell
docker-compose run --rm game bash

# 在容器內執行 npm 命令
docker-compose run --rm game npm install phaser-plugin-example

# 查看容器日誌
docker-compose logs game
```

### 故障排除

#### Electron 視窗無法顯示

```bash
# Linux: 允許 Docker 訪問 X11
xhost +local:docker

# macOS: 安裝並啟動 XQuartz
brew install --cask xquartz
# 然後在 XQuartz 設定中勾選 "Allow connections from network clients"
```

#### 權限問題

```bash
# 如果遇到文件權限問題，重新構建映像
docker-compose build --no-cache
```

#### 清理 Docker 資源

```bash
# 停止並刪除容器
docker-compose down

# 刪除映像
docker rmi rpg-game:dev

# 清理未使用的 Docker 資源
docker system prune
```

## Steam 整合（待實作）

### 安裝 greenworks

```bash
# 進入容器
docker-compose run --rm game bash

# 安裝 greenworks
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
./test.sh
```

## 目前功能

- ✅ Electron + Phaser 3 基礎架構
- ✅ Docker 開發環境
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
