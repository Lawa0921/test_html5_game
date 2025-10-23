#!/bin/bash

# 開發環境啟動腳本

echo "========================================="
echo "  桌面冒險者 - 開發環境"
echo "========================================="
echo ""

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝"
    echo "   請參考 docs/NODE_SETUP.md 安裝 Node.js 22.x"
    exit 1
fi

# 檢查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js 版本過低（當前: $(node --version)）"
    echo "   需要 Node.js 22.x 或更高版本"
    echo "   請參考 docs/NODE_SETUP.md"
    exit 1
fi

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "✓ 首次運行，安裝依賴..."
    npm install
    echo ""
fi

# 啟動開發環境
echo "✓ 啟動開發環境..."
echo ""
echo "提示："
echo "  - Electron 視窗將會彈出"
echo "  - DevTools 會自動打開"
echo "  - 按 Ctrl+C 停止"
echo ""

npm start
