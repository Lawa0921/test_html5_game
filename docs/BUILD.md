# 打包說明文檔

## 一鍵打包 Windows 版本

### 方式 1: 使用簡化腳本 (推薦)

```bash
./scripts/package-win.sh
```

這個腳本會:
- 自動打包 Windows 版本
- 生成兩個版本:
  - **綠色版** (portable): 桌面冒險者-{version}-portable.exe
  - **安裝版** (NSIS): 桌面冒險者 Setup {version}.exe

### 方式 2: 使用完整腳本

```bash
./scripts/build-windows.sh
```

這個腳本會:
1. 檢查 Node.js 環境
2. 檢查並安裝依賴
3. 執行測試
4. 清理舊的打包文件
5. 打包 Windows 版本
6. 生成 README.txt 說明文件

### 方式 3: 使用 npm 命令

```bash
# 只打包 Windows 版本
npm run build:win

# 或使用別名
npm run build:win
```

## 輸出位置

所有打包文件會輸出到 `dist/` 目錄:

```
dist/
├── 桌面冒險者-0.1.0-portable.exe    # 綠色版 (免安裝)
├── 桌面冒險者 Setup 0.1.0.exe       # 安裝版
├── README.txt                        # 使用說明
└── win-unpacked/                     # 未打包的檔案 (測試用)
```

## 打包選項說明

### 綠色版 (Portable)
- **文件名**: 桌面冒險者-{version}-portable.exe
- **特點**:
  - 單一可執行文件
  - 無需安裝,直接運行
  - 可放在任何位置 (USB 隨身碟、桌面等)
  - 適合臨時測試或不想安裝的用戶

### 安裝版 (NSIS)
- **文件名**: 桌面冒險者 Setup {version}.exe
- **特點**:
  - 標準 Windows 安裝程序
  - 可選擇安裝位置
  - 創建桌面快捷方式
  - 創建開始菜單項目
  - 可透過控制台卸載
  - 適合長期使用

## 系統需求

### 開發環境
- Node.js 22.x
- npm 10.x
- Linux/macOS/WSL2

### 目標系統 (Windows)
- Windows 10 或更新版本 (64位元)
- 建議 4GB RAM 以上
- 200MB 可用磁碟空間

## 常見問題

### Q: 為什麼需要 Linux/macOS/WSL2 環境?
A: electron-builder 在 Windows 上打包可能遇到權限問題,建議在 Linux 環境下打包所有平台版本。

### Q: 可以打包其他平台嗎?
A: 可以,使用以下命令:
```bash
npm run build:mac    # macOS 版本
npm run build:linux  # Linux 版本
```

### Q: 打包失敗怎麼辦?
A: 檢查以下項目:
1. Node.js 版本是否為 22.x
2. 依賴是否正確安裝 (`npm install`)
3. 測試是否通過 (`npm test`)
4. 查看錯誤訊息詳細內容

### Q: 如何測試打包後的程序?
A: 可以使用 `dist/win-unpacked/` 目錄中的未打包版本快速測試:
```bash
# 如果是在 WSL2 中
cd dist/win-unpacked
./桌面冒險者.exe
```

### Q: 打包文件太大怎麼辦?
A: 打包文件包含完整的 Electron 運行環境和 Node.js,大小約 150-200MB 是正常的。

## 自定義打包配置

編輯 `electron-builder.v2.config.js` 可以自定義:
- 應用程式名稱
- 圖標
- 安裝選項
- 文件包含/排除規則
- 等等...

## 分發建議

### 上傳到 Windows 電腦
1. 將整個 `dist/` 目錄複製到 Windows 電腦
2. 或只複製需要的 .exe 文件

### 提供給用戶
推薦同時提供兩個版本:
- 綠色版: 方便快速試玩
- 安裝版: 適合長期使用

### 版本說明
在 README.txt 中說明:
- 遊戲功能
- 系統需求
- 快捷鍵
- 常見問題

## 版本號管理

版本號定義在 `package.json` 中:
```json
{
  "version": "0.1.0"
}
```

打包時會自動使用這個版本號。

## 簽名和驗證

**注意**: 當前打包未包含代碼簽名,Windows 可能顯示"未知發行者"警告,這是正常的。

如需代碼簽名:
1. 購買代碼簽名證書
2. 在 `electron-builder.v2.config.js` 中配置簽名選項

## 更新日誌

記得在發布新版本時:
1. 更新 `package.json` 中的版本號
2. 更新 `CHANGELOG.md`
3. 測試新版本
4. 重新打包
