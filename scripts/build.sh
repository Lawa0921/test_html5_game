#!/bin/bash

# 遊戲打包腳本

echo "========================================="
echo "  桌面冒險者 - 打包腳本"
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

# 選擇平台
echo "請選擇目標平台："
echo "  1) Windows (exe)"
echo "  2) macOS (dmg)"
echo "  3) Linux (AppImage)"
echo "  4) 全部平台"
echo ""
read -p "請輸入選項 [1-4]: " choice

case $choice in
    1)
        BUILD_CMD="npm run build:win"
        echo "✓ 目標平台：Windows"
        ;;
    2)
        BUILD_CMD="npm run build:mac"
        echo "✓ 目標平台：macOS"
        ;;
    3)
        BUILD_CMD="npm run build:linux"
        echo "✓ 目標平台：Linux"
        ;;
    4)
        BUILD_CMD="npm run build:all"
        echo "✓ 目標平台：全部"
        ;;
    *)
        echo "❌ 無效選項"
        exit 1
        ;;
esac

echo ""
echo "✓ 開始打包..."
echo ""

$BUILD_CMD

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  ✅ 打包完成！"
    echo "========================================="
    echo ""
    echo "打包檔案位於：./dist/"
    echo ""
    if [ -d "dist" ]; then
        ls -lh dist/
    fi
else
    echo ""
    echo "❌ 打包失敗"
    exit 1
fi
