# 如何運行遊戲

## 快速開始

### 前置需求

- **Node.js 22.x** - [安裝指南](NODE_SETUP.md)
- **npm 10.x**
- Windows 10+ / macOS / Linux

### 安裝依賴

```bash
npm install
```

### 啟動遊戲

```bash
npm start

# 或使用腳本
./scripts/dev.sh
```

### 運行測試

```bash
npm test

# 或使用腳本
./scripts/test.sh
```

---

## 開發命令摘要

```bash
# 開發
npm start           # 啟動遊戲
npm test           # 運行測試

# 打包
npm run build:win  # 打包 Windows 版本
npm run build:mac  # 打包 macOS 版本
npm run build:linux # 打包 Linux 版本

# 腳本方式
./scripts/dev.sh         # 啟動遊戲
./scripts/test.sh        # 運行測試
./scripts/build.sh       # 選擇平台打包
./scripts/package-win.sh # 快速打包 Windows
```

---

## WSL2 環境注意事項

如果你在 WSL2 中開發，建議：

1. **Windows 11**：使用內建的 WSLg，GUI 支持開箱即用
2. **Windows 10**：可能需要設置 X Server，詳見 [WSL2-SETUP.md](WSL2-SETUP.md)

或者，直接在 Windows 上安裝 Node.js 並運行遊戲，避免 WSL2 GUI 配置問題。

---

## 故障排除

### Node.js 版本問題

確保使用 Node.js 22.x：
```bash
node --version  # 應顯示 v22.x.x
```

如果版本不對，請參考 [NODE_SETUP.md](NODE_SETUP.md)

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

### Electron 視窗無法顯示（WSL2）

如果在 WSL2 中遇到 GUI 問題：

1. **Windows 11**：確認 WSLg 已啟用
   ```bash
   echo $DISPLAY  # 應該顯示 :0 或 :1
   ```

2. **Windows 10**：參考 [WSL2-SETUP.md](WSL2-SETUP.md) 設置 X Server

3. **簡單方案**：在 Windows 上直接運行
   ```cmd
   cd \\wsl$\Ubuntu\home\<username>\projects\rpg-game
   npm start
   ```

---

## Web 版本（未來支持）

考慮將遊戲移植為純 Web 版本（不使用 Electron）：
- 直接在瀏覽器中運行
- 更容易分享和部署
- localStorage 存檔仍然可用

### 實現方式
- 使用 Vite 或 webpack 打包
- 將 Phaser 遊戲作為靜態網頁
- 部署到 GitHub Pages 或 Netlify
