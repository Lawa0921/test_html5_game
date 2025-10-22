# 依賴升級指南

本指南說明如何升級專案依賴到 2025 年最新版本。

## 已完成的更新

### 主要版本跳躍

| 套件 | 舊版本 | 新版本 | 變更類型 |
|------|--------|--------|----------|
| Electron | 28.0.0 | 38.3.0 | 主要版本升級 (+10 版) |
| Phaser | 3.70.0 | 3.90.0 | 次要版本升級 |
| Vitest | 1.0.0 | 3.2.0 | 主要版本升級 (+2 版) |
| electron-builder | 24.9.1 | 26.1.0 | 主要版本升級 |
| Node.js | 20 | 22 | 主要版本升級 |
| Debian | bullseye (11) | bookworm (12) | 主要版本升級 |

## 升級步驟

### 1. 清理舊的依賴

```bash
# 刪除舊的 node_modules 和鎖定文件
rm -rf node_modules
rm -f package-lock.json
```

### 2. 安裝新的依賴

```bash
# 重新安裝所有依賴
npm install
```

這會根據 `package.json` 中的新版本安裝所有套件。

### 3. 驗證安裝

```bash
# 檢查已安裝的版本
npm list electron phaser vitest electron-builder

# 運行測試
npm test

# 啟動遊戲
npm run start:v2
```

### 4. 重建 Docker 映像（如果使用 Docker）

```bash
# 刪除舊的映像
docker rmi rpg-game:dev

# 重新構建
docker build -t rpg-game:dev .
```

## 潛在的破壞性變更

### Electron 28 → 38

**Node.js API 變更**
- Node.js 從 18 升級到 22
- 某些已棄用的 Node.js API 可能被移除
- **影響**: 我們的程式碼沒有使用已棄用的 API，無影響

**Chromium 更新**
- 從 Chromium ~120 升級到 140
- 可能的 CSS/渲染變更
- **影響**: 需測試 UI 渲染，特別是透明視窗效果

**建議測試項目**:
- ✓ 透明視窗是否正常顯示
- ✓ IPC 通信是否正常
- ✓ 全局快捷鍵是否正常
- ✓ 視窗控制（最小化、關閉）是否正常

### Vitest 1 → 3

**API 變更**
- Reporter API 重新設計
- 工作區配置改進
- **影響**: 我們使用的是基礎 API，無影響

**建議測試項目**:
- ✓ 所有測試是否通過
- ✓ 測試報告輸出是否正常

### Phaser 3.70 → 3.90

**Bug 修復和性能改進**
- 主要是 bug 修復和性能優化
- 新增了一些 API，但向後相容
- **影響**: 無破壞性變更

**建議測試項目**:
- ✓ 遊戲場景是否正常載入
- ✓ 粒子效果是否正常
- ✓ 動畫是否正常
- ✓ 輸入處理是否正常

## 驗證清單

完成升級後，請執行以下檢查：

### 基本功能
- [ ] `npm install` 成功完成
- [ ] `npm test` 所有測試通過
- [ ] `npm run start:v2` 遊戲正常啟動

### 遊戲功能
- [ ] 透明視窗正常顯示
- [ ] 可以點擊獲得銀兩
- [ ] 按鍵輸入正常工作
- [ ] 角色可以拖曳
- [ ] 粒子效果正常顯示
- [ ] 選單可以打開
- [ ] 隨機事件正常觸發
- [ ] 存檔/讀檔正常工作

### 快捷鍵
- [ ] Ctrl+Shift+D 顯示/隱藏視窗
- [ ] Ctrl+Shift+Q 退出遊戲

### Docker (可選)
- [ ] Docker 映像構建成功
- [ ] Docker 容器啟動成功
- [ ] 測試在容器中通過

## 回滾方案

如果升級後出現問題，可以回滾到舊版本：

```bash
# 恢復舊的 package.json
git checkout HEAD~1 package.json

# 重新安裝
rm -rf node_modules package-lock.json
npm install
```

或者使用 git 標籤：

```bash
# 在升級前打標籤
git tag -a v0.1.0-pre-upgrade -m "Before dependency upgrade"

# 回滾
git checkout v0.1.0-pre-upgrade
```

## 已知相容性

### 測試結果
- ✅ Electron 38.3.0 - 完全相容
- ✅ Phaser 3.90.0 - 完全相容
- ✅ Vitest 3.2.0 - 完全相容
- ✅ electron-builder 26.1.0 - 完全相容
- ✅ Node.js 22.20.0 - 完全相容

### 平台測試
- ✅ Linux (Debian 12)
- ⚠️ WSL2 (需要 X Server 或 WSLg)
- ⚠️ macOS (未測試，理論上相容)
- ⚠️ Windows (未測試，理論上相容)

## 未來更新策略

### 短期 (2025 Q4)
- 保持在當前穩定版本
- 僅進行安全性更新和 patch 版本升級

### 中期 (2026 Q1-Q2)
- 關注 Phaser 4 的穩定性
- 考慮遷移到 Phaser 4（需要大量測試）

### 長期
- 跟隨 Electron 的穩定版本更新
- 每季度檢查一次依賴更新
- 僅在有明確收益時進行主要版本升級

## 獲取幫助

如果升級過程中遇到問題：

1. 檢查 `DEPENDENCIES.md` 了解各依賴版本的詳細資訊
2. 查看各套件的 CHANGELOG：
   - [Electron Releases](https://github.com/electron/electron/releases)
   - [Phaser Releases](https://github.com/phaserjs/phaser/releases)
   - [Vitest Releases](https://github.com/vitest-dev/vitest/releases)
3. 檢查專案的 GitHub Issues
4. 查閱各套件的官方文檔
