#!/bin/bash

# 桌面冒險者 v2.0 啟動腳本

echo "========================================="
echo "  桌面冒險者 v2.0 - 透明桌面遊戲"
echo "========================================="
echo ""

# 檢查依賴
if [ ! -d "node_modules" ]; then
    echo "❌ 未安裝依賴，請先執行: npm install"
    exit 1
fi

# 檢查必要文件
if [ ! -f "main-v2.js" ] || [ ! -f "index-v2.html" ] || [ ! -f "game-v2.js" ]; then
    echo "❌ 缺少必要文件"
    exit 1
fi

# 檢查場景文件
if [ ! -f "src/scenes/DesktopScene.js" ]; then
    echo "❌ 缺少場景文件: src/scenes/DesktopScene.js"
    exit 1
fi

# 檢查遊戲狀態文件
if [ ! -f "src/core/GameStateV2.js" ]; then
    echo "❌ 缺少遊戲狀態文件: src/core/GameStateV2.js"
    exit 1
fi

echo "✓ 所有文件檢查通過"
echo ""
echo "正在啟動遊戲..."
echo ""
echo "提示："
echo "  - 透明視窗將會出現在桌面上"
echo "  - 點擊遊戲視窗或按任意鍵可獲得銀兩"
echo "  - 拖曳角色可移動位置"
echo "  - Ctrl+Shift+D: 顯示/隱藏遊戲視窗"
echo "  - Ctrl+Shift+Q: 退出遊戲"
echo ""

npm run start:v2
