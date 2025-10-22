#!/bin/bash

# 遊戲打包腳本

echo "========================================="
echo "  RPG Game - 打包腳本"
echo "========================================="
echo ""

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
        PLATFORM="--win"
        echo "✓ 目標平台：Windows"
        ;;
    2)
        PLATFORM="--mac"
        echo "✓ 目標平台：macOS"
        ;;
    3)
        PLATFORM="--linux"
        echo "✓ 目標平台：Linux"
        ;;
    4)
        PLATFORM="--win --mac --linux"
        echo "✓ 目標平台：全部"
        ;;
    *)
        echo "❌ 無效選項"
        exit 1
        ;;
esac

echo ""
echo "✓ 開始打包..."

# 在 Docker 容器中打包
docker-compose run --rm game npm run build $PLATFORM

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  ✓ 打包完成！"
    echo "========================================="
    echo ""
    echo "打包檔案位於：./dist/"
    echo ""
    ls -lh dist/
else
    echo ""
    echo "❌ 打包失敗"
    exit 1
fi
