# WSL2 環境設定指南

由於你在 WSL2 環境中開發，可能需要額外設定才能讓 Electron GUI 正常顯示。

## 方案 A：使用 WSLg（推薦 - Windows 11）

如果你使用 **Windows 11**，WSL2 內建 WSLg（GUI 支持），無需額外設定。

### 測試 WSLg

```bash
# 檢查是否有 DISPLAY 環境變數
echo $DISPLAY

# 如果輸出類似 :0 或 :1，表示 WSLg 已啟用
```

### 運行遊戲

```bash
npm start
# 或
./scripts/dev.sh
```

如果 WSLg 已啟用，Electron 視窗應該會直接顯示。

## 方案 B：使用 VcXsrv（Windows 10）

如果你使用 **Windows 10**，需要安裝 X Server。

### 1. 安裝 VcXsrv

下載並安裝：https://sourceforge.net/projects/vcxsrv/

### 2. 啟動 VcXsrv

- 運行 XLaunch
- 選擇 "Multiple windows"
- Display number: 0
- Start no client
- **重要**：勾選 "Disable access control"

### 3. 設定 WSL2

在 WSL2 中執行：

```bash
# 獲取 Windows 主機 IP
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0

# 測試
xclock  # 如果出現時鐘視窗，表示成功
```

### 4. 永久設定

編輯 `~/.bashrc`：

```bash
echo 'export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk "{print \$2}"):0' >> ~/.bashrc
source ~/.bashrc
```

### 5. 運行遊戲

```bash
npm start
# 或
./scripts/dev.sh
```

## 方案 C：直接在 Windows 開發（最簡單）

### 1. 在 Windows 上安裝 Node.js

下載：https://nodejs.org/

### 2. 在 Windows 終端執行

```cmd
cd \\wsl$\Ubuntu\home\lawa0921\projects\rpg-game
npm install
npm start
```

**優點**：
- GUI 直接顯示
- 開發體驗最好
- 無需 X Server 配置

**缺點**：
- 需要在 Windows 上安裝 Node.js

## 推薦方案

1. **Windows 11** → 方案 A（WSLg，開箱即用）
2. **Windows 10** → 方案 C（Windows 直接開發）或方案 B（VcXsrv）

## 驗證環境

檢查 WSL2 GUI 支持：

```bash
echo "1. DISPLAY 環境變數："
echo "   $DISPLAY"

echo "2. Node.js 版本："
node --version

echo "3. npm 版本："
npm --version
```

## 常見問題

### Q: 執行 npm start 後沒有視窗彈出

**A**: 檢查 DISPLAY 環境變數：

```bash
echo $DISPLAY

# 如果為空，設定它（Windows 11 WSLg）
export DISPLAY=:0

# 或（Windows 10 + VcXsrv）
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0

# 重新運行
npm start
```

### Q: Error: Cannot open display

**A**: X Server 未運行或配置錯誤

- **Windows 11**: 確認 WSLg 已啟用（`echo $DISPLAY` 應顯示 `:0` 或 `:1`）
- **Windows 10**: 確認 VcXsrv 正在運行

### Q: WSL2 GUI 太麻煩，有更簡單的方法嗎？

**A**: 是的，直接在 Windows 上運行：

1. 在 Windows 上安裝 Node.js：https://nodejs.org/
2. 在 Windows 終端（PowerShell 或 CMD）執行：
   ```cmd
   cd \\wsl$\Ubuntu\home\<username>\projects\rpg-game
   npm install
   npm start
   ```

這樣 Electron 視窗會直接在 Windows 上顯示，無需任何 X Server 配置。

## 建議

對於 WSL2 環境，我建議：

1. **開發階段**：直接在 Windows 上安裝 Node.js（方案 C）
2. **打包階段**：在 WSL2 中使用腳本打包（可訪問 Linux 工具）

這樣可以獲得最好的開發體驗。
