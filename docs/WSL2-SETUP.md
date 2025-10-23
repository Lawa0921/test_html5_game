# WSL2 環境設定指南

由於你在 WSL2 環境中開發，需要額外設定才能讓 Electron GUI 正常顯示。

## 方案 A：使用 WSLg（推薦 - Windows 11）

如果你使用 **Windows 11**，WSL2 內建 WSLg（GUI 支持），無需額外設定。

### 測試 WSLg

```bash
# 檢查是否有 DISPLAY 環境變數
echo $DISPLAY

# 如果輸出類似 :0 或 :1，表示 WSLg 已啟用
```

### 修改 docker-compose.yml

將 `docker-compose.yml` 中的環境變數改為：

```yaml
environment:
  - DISPLAY=:0
  - WAYLAND_DISPLAY=$WAYLAND_DISPLAY
  - XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR
  - PULSE_SERVER=$PULSE_SERVER
  - ELECTRON_DISABLE_SANDBOX=1
```

然後：

```bash
./scripts/dev.sh
```

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

### 5. 修改 docker-compose.yml

```yaml
environment:
  - DISPLAY=${DISPLAY}
  - ELECTRON_DISABLE_SANDBOX=1
```

## 方案 C：無頭模式開發（不推薦）

如果 GUI 設定太麻煩，可以用瀏覽器開發：

### 1. 改用 Web 開發模式

修改 `package.json`：

```json
"scripts": {
  "dev:web": "npm install && npx http-server -p 3000"
}
```

### 2. 簡化的 index.html

直接在瀏覽器中打開 `http://localhost:3000`

**缺點**：無法測試 Electron 特定功能（視窗管理、原生 API 等）

## 方案 D：直接在 Windows 開發（最簡單）

### 1. 在 Windows 上安裝 Node.js

下載：https://nodejs.org/

### 2. 在 Windows 終端執行

```cmd
cd \\wsl$\Ubuntu\home\lawa0921\projects\rpg-game
npm install
npm start
```

**優點**：
- 無需 Docker
- GUI 直接顯示
- 開發體驗最好

**缺點**：
- 污染 Windows 環境
- 與 Docker 部署環境不一致

## 推薦方案

1. **Windows 11** → 方案 A（WSLg）
2. **Windows 10** → 方案 D（Windows 直接開發）
3. **堅持 Docker** → 方案 B（VcXsrv）

## 驗證環境

執行這個測試腳本：

```bash
# test-display.sh
#!/bin/bash

echo "=== WSL2 環境檢測 ==="
echo ""

echo "1. DISPLAY 環境變數："
echo "   $DISPLAY"
echo ""

echo "2. X11 Socket："
ls -la /tmp/.X11-unix/ 2>/dev/null || echo "   未找到 X11 socket"
echo ""

echo "3. Docker 版本："
docker --version
echo ""

echo "4. WSL 版本："
wsl.exe --version 2>/dev/null || echo "   在 WSL 內部，無法檢測"
echo ""

echo "5. Windows 版本："
cmd.exe /c ver 2>/dev/null
```

## 常見問題

### Q: 執行 dev.sh 後沒有視窗彈出

**A**: 檢查 DISPLAY 環境變數：

```bash
echo $DISPLAY

# 如果為空，設定它
export DISPLAY=:0

# 重新運行
./scripts/dev.sh
```

### Q: Error: Cannot open display

**A**: X Server 未運行或配置錯誤

- Windows 11: 確認 WSLg 已啟用
- Windows 10: 確認 VcXsrv 正在運行

### Q: Docker 無法訪問 X11

**A**: 執行：

```bash
xhost +local:docker
```

## 建議

對於 WSL2 環境，我建議：

1. **開發階段**：直接在 Windows 上安裝 Node.js 和 Electron（方案 D）
2. **打包階段**：使用 Docker（確保一致性）

這樣可以獲得最好的開發體驗。
