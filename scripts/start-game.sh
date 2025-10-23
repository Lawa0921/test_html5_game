#!/bin/bash

# 簡化的遊戲啟動腳本（直接使用 docker run）

echo "========================================="
echo "  RPG Game - 桌面冒險者"
echo "========================================="
echo ""

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 檢查映像是否存在
if [[ "$(docker images -q rpg-game:dev 2> /dev/null)" == "" ]]; then
    echo "✓ 首次運行，構建 Docker 映像..."
    docker build -t rpg-game:dev .
fi

# 允許 Docker 容器訪問 X11（GUI 顯示）
echo "✓ 設定 X11 權限..."
xhost +local:docker > /dev/null 2>&1

# 啟動遊戲
echo "✓ 啟動遊戲..."
echo ""
echo "提示："
echo "  - 遊戲視窗將會彈出"
echo "  - 按 Ctrl+C 停止"
echo ""

docker run --rm \
  -e DISPLAY=$DISPLAY \
  -e ELECTRON_DISABLE_SANDBOX=1 \
  -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
  -v "$(pwd)/src:/app/src" \
  -v "$(pwd)/main.js:/app/main.js" \
  -v "$(pwd)/game.js:/app/game.js" \
  -v "$(pwd)/index.html:/app/index.html" \
  --network host \
  rpg-game:dev npm start

# 清理
echo ""
echo "✓ 清理..."
xhost -local:docker > /dev/null 2>&1
