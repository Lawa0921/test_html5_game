# 依賴項版本說明

本文檔記錄了專案使用的主要依賴項及其版本選擇原因。

## 運行時依賴

### Phaser 3.90.0
- **發布日期**: 2025 年 5 月
- **選擇原因**: Phaser 3 系列的最後一個穩定版本
- **注意事項**: Phaser 4 已進入 RC 階段，但我們保持使用 v3 以確保穩定性
- **更新策略**: 當 Phaser 4 正式發布且穩定後再考慮遷移

## 開發依賴

### Electron 38.3.0
- **發布日期**: 2025 年 10 月
- **使用的 Chromium**: 140.0.7339.240
- **使用的 Node.js**: 22.20.0
- **選擇原因**: 最新穩定版本，支援透明視窗和所有桌面功能
- **更新策略**: 跟隨 Electron 的穩定版本更新

### Vitest 3.2.0
- **發布日期**: 2025 年 6 月
- **選擇原因**: 最新穩定版本，支援 Vite 7.0
- **特點**:
  - 改進的瀏覽器模式
  - 增強的 TypeScript 支援
  - 重新設計的報告 API
- **更新策略**: 保持在 v3.x 系列，v4 仍在 beta 階段

### electron-builder 26.1.0
- **發布日期**: 2025 年 10 月
- **選擇原因**: 最新穩定版本，支援 Electron 38
- **功能**: 跨平台打包、自動更新支援
- **更新策略**: 跟隨穩定版本更新

## Node.js 版本

### Node.js 22.20.0
- **選擇原因**: Electron 38 內建的 Node.js 版本
- **LTS 狀態**: Node.js 22 是當前的 Active LTS
- **Docker 鏡像**: node:22-bookworm (Debian 12)

## 檢查更新

定期檢查依賴更新：

```bash
# 檢查過期的依賴
npm outdated

# 更新到最新次版本（安全）
npm update

# 查看最新版本
npm view <package-name> versions --json
```

## 相容性矩陣

| 依賴項 | 版本 | Node.js | 狀態 |
|--------|------|---------|------|
| Electron | 38.3.0 | 22.20.0 | ✅ 穩定 |
| Phaser | 3.90.0 | ≥16 | ✅ 穩定 |
| Vitest | 3.2.0 | ≥18 | ✅ 穩定 |
| electron-builder | 26.1.0 | ≥18 | ✅ 穩定 |

## 已知問題

### Electron 透明視窗
- **問題**: 某些 Linux 桌面環境可能不完全支援透明視窗
- **解決方案**: 使用支援合成器的桌面環境（如 GNOME、KDE）

### WSL2 GUI 支援
- **問題**: WSL2 需要 X Server 或 WSLg
- **解決方案**:
  - Windows 11: 內建 WSLg 支援
  - Windows 10: 安裝 VcXsrv 或 X410

## 更新記錄

- **2025-10-22**: 初始化依賴版本
  - Electron: 28.0.0 → 38.3.0
  - Phaser: 3.70.0 → 3.90.0
  - Vitest: 1.0.0 → 3.2.0
  - electron-builder: 24.9.1 → 26.1.0
  - Node.js: 20 → 22
  - Debian: bullseye → bookworm
