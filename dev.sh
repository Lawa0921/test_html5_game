#!/bin/bash

# 開發環境啟動腳本

echo "========================================="
echo "  RPG Game - 開發環境"
echo "========================================="
echo ""

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 允許 Docker 容器訪問 X11（GUI 顯示）
echo "✓ 設定 X11 權限..."
xhost +local:docker > /dev/null 2>&1

# 構建 Docker 映像（如果不存在）
if [[ "$(docker images -q rpg-game:dev 2> /dev/null)" == "" ]]; then
    echo "✓ 首次運行，構建 Docker 映像..."
    docker-compose build
fi

# 啟動開發容器
echo "✓ 啟動開發環境..."
echo ""
echo "提示："
echo "  - 遊戲視窗將會彈出"
echo "  - 修改代碼會自動重新載入"
echo "  - 按 Ctrl+C 停止"
echo ""

docker-compose up game

# 清理
echo ""
echo "✓ 清理..."
xhost -local:docker > /dev/null 2>&1
