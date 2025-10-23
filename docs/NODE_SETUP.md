# Node.js 設置說明

本專案使用 **Node.js 22.21.0**（透過 nvm 管理）以確保與所有依賴項的完全相容性。

## 系統需求

- **Node.js**: 22.21.0 或更高版本（推薦使用 nvm 管理）
- **npm**: 10.9.4 或更高版本（隨 Node.js 22 自帶）
- **nvm**: 0.40.1 或更高版本（Node 版本管理器）

## 快速設置

### 1. 安裝 nvm（如果尚未安裝）

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

### 2. 安裝 Node.js 22

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### 3. 驗證安裝

```bash
node --version  # 應顯示 v22.21.0
npm --version   # 應顯示 10.9.4
```

### 4. 安裝專案依賴

```bash
npm install
```

### 5. 運行測試

```bash
npm test
```

## 為什麼使用 Node.js 22？

### 相容性要求

Electron 38.4.0 內建 Node.js 22.20.0，使用相同或更新的 Node.js 版本可以：

1. **消除引擎警告** - 避免 `EBADENGINE` 警告
2. **確保 API 一致性** - Electron 和開發環境使用相同的 Node.js API
3. **原生模組相容** - 確保原生模組正確編譯
4. **最新功能** - 支援最新的 JavaScript 特性

### 已消除的警告

升級到 Node.js 22.21.0 後，以下警告已被消除：

```
❌ 舊警告（Node.js 20.19.3）:
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: '@electron/rebuild@4.0.1',
npm warn EBADENGINE   required: { node: '>=22.12.0' },
npm warn EBADENGINE   current: { node: 'v20.19.3', npm: '11.5.1' }
}
```

✅ **現在沒有引擎相關警告**

### 剩餘的棄用警告

以下警告來自依賴的依賴（transitive dependencies），不是我們直接控制的：

```bash
npm warn deprecated inflight@1.0.6
npm warn deprecated rimraf@2.6.3
npm warn deprecated glob@7.2.3
npm warn deprecated boolean@3.2.0
```

**這些警告可以安全忽略**，因為：
- 它們來自間接依賴
- 不影響應用程序功能
- 當上游套件更新時會自動解決

## 切換 Node.js 版本

如果你有多個專案需要不同的 Node.js 版本：

```bash
# 查看已安裝的版本
nvm list

# 切換到特定版本
nvm use 22

# 查看當前版本
node --version
```

## 專案內自動切換

你可以創建 `.nvmrc` 文件來自動切換版本：

```bash
echo "22" > .nvmrc
```

然後在專案目錄中：

```bash
nvm use  # 自動使用 .nvmrc 中指定的版本
```

## CI/CD 環境

在 CI/CD 環境中，確保使用 Node.js 22：

### GitHub Actions

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
```

### Docker

```dockerfile
FROM node:22-bookworm
```

## 故障排除

### nvm 命令找不到

如果安裝後 `nvm` 命令仍無法使用：

```bash
# 手動載入 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### npm install 失敗

```bash
# 清理快取並重新安裝
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Electron 無法啟動

確保使用正確的 Node.js 版本：

```bash
nvm use 22
npm run start:v2
```

## 版本歷史

| 日期 | Node.js | npm | Electron | 說明 |
|------|---------|-----|----------|------|
| 2025-10-22 | 22.21.0 | 10.9.4 | 38.4.0 | 初始設置，消除所有引擎警告 |

## 參考資料

- [Node.js 官方文檔](https://nodejs.org/)
- [nvm GitHub](https://github.com/nvm-sh/nvm)
- [Electron 版本對照](https://releases.electronjs.org/)
- [專案依賴說明](DEPENDENCIES.md)
