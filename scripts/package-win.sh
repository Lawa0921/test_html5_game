#!/bin/bash

# 簡化的一鍵打包腳本
# 桌面冒險者 - Windows 版本

echo "======================================"
echo "  桌面冒險者 - Windows 一鍵打包"
echo "======================================"
echo ""

# 執行打包
echo "正在打包 Windows 版本..."
echo ""

npm run build:win

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "  ✅ 打包成功!"
    echo "======================================"
    echo ""
    echo "輸出位置: dist/"
    echo ""
    echo "生成的文件:"
    ls -lh dist/*.exe 2>/dev/null || echo "  (文件生成中...)"
    echo ""
    echo "將 dist/ 目錄中的 .exe 文件複製到 Windows 電腦即可運行"
else
    echo ""
    echo "❌ 打包失敗,請查看錯誤訊息"
    exit 1
fi
