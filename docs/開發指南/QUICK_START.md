# 悅來客棧 - 快速開始指南

> **文檔版本**: v1.0
> **最後更新**: 2025-10-28
> **適用系統**: Windows / macOS / Linux / WSL2

## 📋 文檔說明

本文檔是**開發環境設置和遊戲運行的一站式指南**，整合了環境準備、運行、測試和打包的所有步驟。

---

## 第一部分：環境準備

### 1.1 系統需求

**開發環境**:
- **Node.js**: 22.21.0 或更高（必須）
- **npm**: 10.9.4 或更高（隨 Node.js 22 自帶）
- **nvm**: 0.40.1 或更高（推薦，版本管理）
- **系統**: Windows 10+ / macOS / Linux / WSL2

**目標系統（打包後）**:
- Windows 10 或更新版本（64位元）
- macOS（待測試）
- Linux（待測試）
- 建議 4GB RAM 以上
- 200MB 可用磁碟空間

---

### 1.2 安裝 Node.js（使用 nvm）

#### Step 1: 安裝 nvm

**Linux / macOS / WSL2**:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

安裝後重新載入 shell 配置：
```bash
# 對於 bash 用戶
source ~/.bashrc

# 對於 zsh 用戶
source ~/.zshrc
```

**Windows**:
- 下載 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
- 或直接下載 [Node.js 22](https://nodejs.org/)（不使用 nvm）

#### Step 2: 安裝 Node.js 22

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

#### Step 3: 驗證安裝

```bash
node --version  # 應顯示 v22.21.0 或更高
npm --version   # 應顯示 10.9.4 或更高
```

---

### 1.3 為什麼使用 Node.js 22？

**相容性要求**:
- Electron 38.4.0 內建 Node.js 22.20.0
- 使用相同版本可以：
  1. ✅ 消除引擎警告（`EBADENGINE`）
  2. ✅ 確保 API 一致性
  3. ✅ 原生模組正確編譯
  4. ✅ 支援最新 JavaScript 特性

**升級前後對比**:
```
❌ 舊版（Node.js 20.19.3）:
npm warn EBADENGINE Unsupported engine {
  package: '@electron/rebuild@4.0.1',
  required: { node: '>=22.12.0' }
}

✅ 現在（Node.js 22.21.0）:
沒有引擎相關警告
```

---

### 1.4 WSL2 環境特別說明

如果你在 WSL2 中開發，GUI 支持有三種方案：

#### 方案 A：使用 WSLg（推薦 - Windows 11）

Windows 11 內建 WSLg，無需額外設定。

**測試 WSLg**:
```bash
echo $DISPLAY
# 如果輸出 :0 或 :1，表示 WSLg 已啟用
```

**運行遊戲**:
```bash
npm start  # Electron 視窗會直接顯示
```

#### 方案 B：使用 VcXsrv（Windows 10）

**1. 安裝 VcXsrv**:
下載：https://sourceforge.net/projects/vcxsrv/

**2. 啟動 VcXsrv**:
- 運行 XLaunch
- 選擇 "Multiple windows"
- Display number: 0
- ⚠️ 重要：勾選 "Disable access control"

**3. 設定 WSL2**:
```bash
# 獲取 Windows 主機 IP
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0

# 測試（如果出現時鐘視窗，表示成功）
xclock
```

**4. 永久設定**:
```bash
echo 'export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk "{print \$2}"):0' >> ~/.bashrc
source ~/.bashrc
```

#### 方案 C：直接在 Windows 開發（最簡單）

**優點**:
- ✅ GUI 直接顯示
- ✅ 開發體驗最好
- ✅ 無需 X Server 配置

**步驟**:
1. 在 Windows 上安裝 Node.js：https://nodejs.org/
2. 在 Windows 終端執行：
   ```cmd
   cd \\wsl$\Ubuntu\home\<username>\projects\rpg-game
   npm install
   npm start
   ```

**推薦方案**:
- Windows 11 → 方案 A（WSLg）
- Windows 10 → 方案 C（Windows 直接開發）

---

## 第二部分：安裝與運行

### 2.1 安裝專案依賴

```bash
cd /path/to/rpg-game
npm install
```

**預期輸出**:
```
added 845 packages in 2m
```

**常見警告（可忽略）**:
```bash
npm warn deprecated inflight@1.0.6
npm warn deprecated rimraf@2.6.3
npm warn deprecated glob@7.2.3
```
這些來自間接依賴，不影響功能。

---

### 2.2 運行遊戲（開發模式）

**方法 1：使用 npm 腳本**
```bash
npm start
```

**方法 2：使用開發腳本**
```bash
./scripts/dev.sh
```

**預期行為**:
- Electron 視窗啟動
- DevTools 自動打開
- 支持熱重載（部分功能）

**如果視窗沒有出現**:
- WSL2 用戶：檢查 `$DISPLAY` 環境變數
- Windows 用戶：確認沒有防火牆阻擋
- macOS 用戶：確認允許應用程式訪問

---

### 2.3 運行測試

#### 完整測試套件

```bash
npm test
```

**預期輸出**:
```
Test Files  32 passed (32)
Tests  1173 passed (1173)
Duration  5.16s
```

#### 測試覆蓋率

```bash
npm test -- --coverage
```

**查看 HTML 報告**:
```bash
# 生成後打開
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

**當前覆蓋率**:
- 總覆蓋率：83.81%
- Managers：85.97%
- 測試數量：1173個

#### 運行特定測試

```bash
npm test -- characterDispatchManager.test.js
npm test -- --grep "烹飪"  # 模糊匹配
```

---

## 第三部分：打包發布

### 3.1 快速打包 Windows 版本（推薦）

```bash
./scripts/package-win.sh
```

**輸出文件**:
```
dist/
├── 桌面冒險者-0.1.0-portable.exe    # 綠色版（免安裝）
├── 桌面冒險者 Setup 0.1.0.exe       # 安裝版
├── README.txt                        # 使用說明
└── win-unpacked/                     # 未打包（測試用）
```

---

### 3.2 完整打包流程（含測試）

```bash
./scripts/build-windows.sh
```

**執行步驟**:
1. ✅ 檢查 Node.js 環境
2. ✅ 檢查並安裝依賴
3. ✅ 執行測試
4. ✅ 清理舊的打包文件
5. ✅ 打包 Windows 版本
6. ✅ 生成 README.txt 說明文件

---

### 3.3 打包其他平台

```bash
npm run build:mac    # macOS 版本（需在 macOS 上執行）
npm run build:linux  # Linux 版本
npm run build        # 互動式選擇平台
```

**注意事項**:
- macOS 版本需要在 macOS 上打包
- Linux 版本可以在 WSL2/Linux 上打包
- Windows 版本建議在 Linux/WSL2 上打包（權限更好）

---

### 3.4 版本號管理

版本號定義在 `package.json`:
```json
{
  "version": "0.1.0"
}
```

**發布新版本**:
1. 更新 `package.json` 中的版本號
2. 更新 `CHANGELOG.md`
3. 測試新版本：`npm test`
4. 重新打包：`./scripts/package-win.sh`

---

## 第四部分：常見問題

### 4.1 環境問題

#### Q: Node.js 版本錯誤

**問題**:
```
Error: The engine "node" is incompatible with this module.
```

**解決方案**:
```bash
# 檢查版本
node --version

# 如果不是 v22.x，切換版本
nvm use 22

# 如果沒有安裝，安裝它
nvm install 22
```

---

#### Q: npm install 失敗

**問題**:
```
npm ERR! code ELIFECYCLE
```

**解決方案**:
```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

### 4.2 運行問題

#### Q: Electron 視窗無法顯示（WSL2）

**解決方案**:
```bash
# 檢查 DISPLAY
echo $DISPLAY

# 如果為空（Windows 11 WSLg）
export DISPLAY=:0

# 如果為空（Windows 10 + VcXsrv）
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0

# 重新運行
npm start
```

---

#### Q: 測試失敗

**解決方案**:
```bash
# 查看詳細錯誤
npm test -- --reporter=verbose

# 如果是特定測試失敗，單獨運行
npm test -- tests/failedTest.test.js
```

---

### 4.3 打包問題

#### Q: 打包失敗

**常見原因**:
1. Node.js 版本不對（需要 22.x）
2. 依賴未正確安裝
3. 測試未通過

**解決方案**:
```bash
# 1. 檢查 Node.js
node --version  # 必須是 v22.x

# 2. 重新安裝依賴
rm -rf node_modules package-lock.json
npm install

# 3. 運行測試
npm test

# 4. 重新打包
./scripts/package-win.sh
```

---

#### Q: 打包文件太大

**回答**:
- 打包文件包含完整的 Electron 運行環境和 Node.js
- 大小約 150-200MB 是正常的
- 這是跨平台桌面應用的標準大小

---

## 第五部分：開發工作流

### 5.1 典型開發流程

```bash
# 1. 拉取最新代碼
git pull

# 2. 安裝/更新依賴
npm install

# 3. 運行開發模式
npm start

# 4. 修改代碼...

# 5. 運行測試
npm test

# 6. 提交代碼
git add .
git commit -m "feat: 新功能描述"
git push
```

---

### 5.2 快捷指令速查

```bash
# 開發
npm start           # 啟動遊戲（開發模式）
npm test           # 運行測試
npm test -- --coverage  # 測試 + 覆蓋率

# 打包
./scripts/package-win.sh    # 快速打包 Windows
./scripts/build-windows.sh  # 完整打包（含測試）
./scripts/build.sh          # 互動式選擇平台

# 開發腳本
./scripts/dev.sh    # 啟動遊戲
./scripts/test.sh   # 運行測試

# 資源生成
npm run assets:generate       # 生成所有資源
npm run assets:placeholders   # 角色立繪與背景
npm run assets:animations     # 角色動畫幀
npm run assets:combat         # 戰鬥系統 UI
npm run assets:quest          # 任務物品
npm run assets:scenes         # 場景物件

# 驗證
npm run validate:character {characterId}  # 驗證角色資源
```

---

### 5.3 項目切換（多版本 Node.js）

如果你有多個專案需要不同的 Node.js 版本：

```bash
# 查看已安裝的版本
nvm list

# 切換到特定版本
nvm use 22      # 本專案
nvm use 20      # 其他專案

# 查看當前版本
node --version

# 創建 .nvmrc 文件（自動切換）
echo "22" > .nvmrc

# 然後在專案目錄中
nvm use  # 自動使用 .nvmrc 中指定的版本
```

---

## 第六部分：參考資料

### 6.1 官方文檔

- [Node.js 官方文檔](https://nodejs.org/)
- [nvm GitHub](https://github.com/nvm-sh/nvm)
- [Electron 官方文檔](https://www.electronjs.org/)
- [Phaser 3 官方文檔](https://phaser.io/phaser3)
- [Vitest 官方文檔](https://vitest.dev/)

### 6.2 項目文檔

- [遊戲總覽](../核心設計/GAME_OVERVIEW.md) - 設計理念和故事
- [系統設計](../核心設計/SYSTEM_DESIGN.md) - 系統架構和數值
- [技術架構](../核心設計/TECHNICAL_ARCHITECTURE.md) - 代碼結構
- [角色資料庫](../核心設計/CHARACTER_DATABASE.md) - 角色設定
- [資產管理](../資源管理/ASSET_MASTER_SPEC.md) - 資源規範

### 6.3 腳本說明

| 腳本文件 | 用途 | 說明 |
|---------|------|------|
| `scripts/dev.sh` | 啟動開發模式 | 自動打開 DevTools |
| `scripts/test.sh` | 運行測試 | 包含覆蓋率報告 |
| `scripts/package-win.sh` | 快速打包 Windows | 只打包，不測試 |
| `scripts/build-windows.sh` | 完整構建 Windows | 測試 + 打包 |
| `scripts/build.sh` | 互動式構建 | 選擇平台 |

---

## 附錄 A：CI/CD 環境設置

### GitHub Actions

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'

- run: npm install
- run: npm test
- run: npm run build:win
```

### Docker

```dockerfile
FROM node:22-bookworm

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
CMD ["npm", "start"]
```

---

## 附錄 B：故障排除清單

- [ ] Node.js 版本正確（v22.x）
- [ ] npm 版本正確（v10.x）
- [ ] 依賴安裝完整（`npm install` 無錯誤）
- [ ] 測試全部通過（`npm test` 綠色）
- [ ] WSL2 環境 DISPLAY 已設置（如適用）
- [ ] 防火牆未阻擋 Electron（Windows）
- [ ] X Server 正在運行（Windows 10 WSL2）

---

**文檔版本**: v1.0
**最後更新**: 2025-10-28
**維護者**: 開發團隊
