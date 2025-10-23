# 專案結構說明

這是專案的目錄結構和文件組織說明。

## 📁 根目錄結構

```
rpg-game/
├── assets/              # 遊戲資源
│   ├── sprites/         # 角色、物件精靈圖
│   ├── audio/           # 音效和音樂
│   └── icon.png         # 應用程式圖標（原始檔）
│
├── docs/                # 📚 專案文檔
│   ├── BUILD.md         # 打包說明
│   ├── CHANGELOG.md     # 版本更新日誌
│   ├── DEPENDENCIES.md  # 依賴項說明
│   ├── GAME_DESIGN.md   # 遊戲設計文檔
│   ├── LICENSE          # MIT 授權條款
│   ├── NODE_SETUP.md    # Node.js 環境設定
│   ├── README_V2.md     # V2 版本說明
│   ├── RUN.md           # 運行指南
│   ├── UPGRADE_GUIDE.md # 升級指南
│   └── WSL2-SETUP.md    # WSL2 環境設定
│
├── scripts/             # 🛠️ 開發和打包腳本
│   ├── dev.sh           # 啟動開發環境
│   ├── test.sh          # 執行測試
│   ├── build.sh         # 通用打包腳本
│   ├── build-windows.sh # Windows 完整打包（含測試）
│   ├── package-win.sh   # Windows 快速打包
│   ├── start-game.sh    # 啟動遊戲（V1）
│   └── start-v2.sh      # 啟動遊戲（V2）
│
├── src/                 # 💻 遊戲源碼
│   ├── audio/           # 音訊管理
│   │   └── AudioManager.js
│   │
│   ├── core/            # 核心遊戲邏輯
│   │   ├── GameState.js    # V1 遊戲狀態（舊版）
│   │   └── GameStateV2.js  # V2 遊戲狀態（新版）
│   │
│   ├── scenes/          # Phaser 遊戲場景
│   │   ├── BootScene.js      # 啟動場景
│   │   ├── BattleScene.js    # 戰鬥場景（V1）
│   │   └── DesktopScene.js   # 桌面寵物場景（V2）
│   │
│   ├── story/           # 故事系統
│   │   └── StoryManager.js
│   │
│   ├── ui/              # 使用者介面
│   │   └── UIManager.js
│   │
│   └── steam/           # Steam 整合（待實作）
│
├── tests/               # 🧪 測試文件
│   ├── example.test.js
│   └── gameState.test.js
│
├── CLAUDE.md            # Claude Code 專案指引
├── README.md            # 專案主說明文件
├── package.json         # Node.js 專案配置
├── vitest.config.js     # 測試框架配置
│
├── electron-builder.config.js  # Electron 打包配置
├── docker-compose.yml   # Docker Compose 配置
├── Dockerfile           # Docker 映像配置
│
├── main.js              # Electron 主程序
├── game.js              # Phaser 遊戲入口
└── index.html           # 遊戲 HTML 頁面
```

## 🗂️ 目錄職責說明

### `assets/` - 資源目錄
存放所有遊戲資源，包括：
- 精靈圖（sprites）
- 音效和背景音樂（audio）
- 應用程式圖標（icon.png）

**注意**：`icon.ico` 是自動生成的，不進入版控。

### `docs/` - 文檔目錄
所有專案相關文檔集中在此，包括：
- 技術文檔（BUILD.md、NODE_SETUP.md、WSL2-SETUP.md）
- 遊戲設計文檔（GAME_DESIGN.md）
- 版本管理（CHANGELOG.md、UPGRADE_GUIDE.md）
- 授權條款（LICENSE）

### `scripts/` - 腳本目錄
所有開發、測試、打包腳本集中在此：
- **開發腳本**：`dev.sh`、`start-*.sh`
- **測試腳本**：`test.sh`
- **打包腳本**：`build.sh`、`build-windows.sh`、`package-win.sh`

使用方式：
```bash
./scripts/dev.sh              # 啟動開發環境
./scripts/test.sh             # 執行測試
./scripts/package-win.sh      # 快速打包 Windows 版本
./scripts/build-windows.sh    # 完整打包（含測試）
```

### `src/` - 源碼目錄
遊戲核心程式碼：

- **`audio/`**：音訊管理系統
- **`core/`**：遊戲狀態管理、資源系統
- **`scenes/`**：Phaser 遊戲場景
- **`story/`**：故事系統、事件管理
- **`ui/`**：使用者介面元件
- **`steam/`**：Steam API 整合（待實作）

### `tests/` - 測試目錄
單元測試和整合測試：
- 使用 Vitest 框架
- 命名規則：`*.test.js`
- 執行：`./scripts/test.sh`

## 📦 打包輸出

打包後的文件會輸出到 `dist/` 目錄（不進入版控）：

```
dist/
├── 桌面冒險者-0.1.0-portable.exe    # 綠色版（免安裝）
├── 桌面冒險者 Setup 0.1.0.exe       # 安裝版
├── README.txt                        # 使用說明
└── win-unpacked/                     # 未打包版本（測試用）
```

## 🚫 不進入版控的文件

以下文件/目錄已在 `.gitignore` 中排除：

- `node_modules/` - npm 依賴
- `dist/` - 打包輸出
- `coverage/` - 測試覆蓋率報告
- `*.exe`、`*.dmg`、`*.AppImage` - 可執行文件
- `assets/icon.ico` - 自動生成的圖標
- `*.log` - 日誌文件
- `.env` - 環境變數

## 📝 遊戲特色

- **桌面寵物模式**：透明視窗，遊戲角色直接顯示在桌面上
- **完全透明背景**：與桌面無縫整合
- **右下角 UI 系統**：折疊/展開式介面，不妨礙工作
- **RPG 介面**：7 個分頁（狀態、職業、裝備、道具、技能、製造、開發）
- **故事系統**：主線故事、角色故事、隨機事件
- **音訊管理**：背景音樂和音效控制
- **自動存檔**：遊戲進度自動保存

### 歷史版本

舊的 V1 版本（回合制戰鬥遊戲）已歸檔至 `docs/archive/v1/`，供參考使用。

## 🔧 快速指令參考

```bash
# 開發
./scripts/dev.sh           # 啟動開發環境
./scripts/test.sh          # 執行測試

# 打包
./scripts/package-win.sh   # Windows 快速打包
./scripts/build.sh         # 選擇平台打包

# Docker
docker-compose up          # 啟動容器
docker-compose down        # 停止容器
```

## 📚 更多資訊

- 詳細開發指南：`CLAUDE.md`
- 打包說明：`docs/BUILD.md`
- 遊戲設計：`docs/GAME_DESIGN.md`
- 版本更新：`docs/CHANGELOG.md`
