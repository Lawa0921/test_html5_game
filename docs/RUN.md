# 如何運行遊戲

## 方法 1：本機直接運行（推薦）

這是最簡單的方式，不需要處理 Docker + X11 的複雜配置。

### 步驟

1. **安裝 Node.js 依賴**
   ```bash
   npm install
   ```

2. **啟動遊戲**
   ```bash
   npm start
   ```

3. **運行測試**
   ```bash
   npm test
   ```

### 優點
- 啟動快速
- 無 Docker 配置問題
- 開發體驗更好（熱重載更快）

### 缺點
- 需要在本機安裝 Node.js 和 Electron

---

## 方法 2：Docker 運行（隔離環境）

適合想要完全隔離環境的情況，但需要配置 X11 轉發。

### WSL2 環境配置

1. **安裝 X Server（在 Windows 主機上）**

   下載並安裝以下任一工具：
   - [VcXsrv](https://sourceforge.net/projects/vcxsrv/)
   - [Xming](https://sourceforge.net/projects/xming/)
   - [X410](https://x410.dev/) (付費)

2. **啟動 X Server**

   以 VcXsrv 為例：
   - 啟動 XLaunch
   - 選擇 "Multiple windows"
   - Display number: 0
   - 勾選 "Disable access control"

3. **配置 WSL2 的 DISPLAY**

   在 WSL2 終端中：
   ```bash
   # 獲取 Windows 主機 IP
   export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0

   # 測試 X11 是否正常
   xeyes  # 如果看到一雙眼睛，說明配置成功
   ```

4. **運行遊戲**
   ```bash
   ./start-game.sh
   ```

### 故障排除

#### Electron 視窗無法顯示
```bash
# 確認 DISPLAY 變數
echo $DISPLAY

# 應該顯示類似：172.x.x.x:0

# 允許 Docker 訪問 X11
xhost +local:docker
```

#### GPU 相關錯誤
這些錯誤在 Docker 中是正常的，不影響遊戲運行：
```
ERROR:viz_main_impl.cc(196)] Exiting GPU process due to errors
```

---

## 方法 3：Web 版本（未來支持）

考慮將遊戲移植為純 Web 版本（不使用 Electron），這樣可以：
- 直接在瀏覽器中運行
- 更容易分享和部署
- 無需 Docker 或 X11 配置

### 實現方式
- 使用 Vite 或 webpack 打包
- 將 Phaser 遊戲作為靜態網頁
- localStorage 存檔仍然可用

---

## 開發命令摘要

```bash
# 本機開發
npm start           # 啟動遊戲
npm test           # 運行測試
npm run build:win  # 打包 Windows 版本
npm run build:mac  # 打包 macOS 版本
npm run build:linux # 打包 Linux 版本

# Docker 開發
./start-game.sh    # 啟動遊戲（Docker）
./scripts/test.sh         # 運行測試（Docker）
./scripts/build.sh        # 打包遊戲（Docker）
```

---

## 推薦開發流程

1. **開發階段**：使用本機運行（`npm start`）
2. **測試階段**：在 Docker 中測試（`./scripts/test.sh`）
3. **打包階段**：使用 Docker 構建跨平台版本（`./scripts/build.sh`）

這樣可以兼顧開發效率和環境一致性。
