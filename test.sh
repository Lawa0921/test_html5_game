#!/bin/bash

# 測試腳本

echo "========================================="
echo "  RPG Game - 運行測試"
echo "========================================="
echo ""

echo "✓ 啟動測試容器..."

docker compose run --rm test

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 測試通過"
else
    echo ""
    echo "❌ 測試失敗"
    exit 1
fi
