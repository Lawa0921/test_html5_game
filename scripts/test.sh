#!/bin/bash

# 測試腳本

echo "========================================="
echo "  桌面冒險者 - 運行測試"
echo "========================================="
echo ""

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝"
    echo "   請參考 docs/NODE_SETUP.md 安裝 Node.js 22.x"
    exit 1
fi

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "✓ 安裝依賴..."
    npm install
    echo ""
fi

echo "✓ 運行測試..."
echo ""

npm test

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 所有測試通過"
else
    echo ""
    echo "❌ 測試失敗"
    exit 1
fi
