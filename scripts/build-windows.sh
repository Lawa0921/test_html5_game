#!/bin/bash

# 一鍵打包 Windows 版本腳本
# 桌面冒險者 - Desktop RPG

set -e

echo "=================================="
echo "  桌面冒險者 - Windows 打包工具"
echo "=================================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查 Node.js
echo -e "${BLUE}[1/5]${NC} 檢查 Node.js 環境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}錯誤: 未找到 Node.js${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js 版本: $NODE_VERSION"
echo ""

# 檢查依賴
echo -e "${BLUE}[2/5]${NC} 檢查依賴項..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} 未找到 node_modules,正在安裝依賴..."
    npm install
else
    echo -e "${GREEN}✓${NC} 依賴項已安裝"
fi
echo ""

# 執行測試
echo -e "${BLUE}[3/5]${NC} 執行測試..."
if npm test; then
    echo -e "${GREEN}✓${NC} 所有測試通過"
else
    echo -e "${RED}✗${NC} 測試失敗"
    read -p "測試失敗,是否繼續打包? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# 清理舊的打包文件
echo -e "${BLUE}[4/5]${NC} 清理舊的打包文件..."
if [ -d "dist" ]; then
    echo "正在刪除 dist/ 目錄..."
    rm -rf dist
    echo -e "${GREEN}✓${NC} 清理完成"
else
    echo -e "${GREEN}✓${NC} 無需清理"
fi
echo ""

# 開始打包
echo -e "${BLUE}[5/5]${NC} 開始打包 Windows 版本..."
echo -e "${YELLOW}這可能需要幾分鐘時間...${NC}"
echo ""

if npm run build:win; then
    echo ""
    echo -e "${GREEN}=================================="
    echo "  打包成功!"
    echo -e "==================================${NC}"
    echo ""
    echo "輸出文件位置: dist/"
    echo ""

    # 列出打包後的文件
    if [ -d "dist" ]; then
        echo "打包文件列表:"
        ls -lh dist/ | grep -E '\.(exe|zip|7z)$' || echo "  (正在生成...)"
        echo ""

        # 計算總大小
        TOTAL_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
        echo "總大小: $TOTAL_SIZE"
        echo ""

        # 查找可執行文件
        PORTABLE=$(find dist/ -name "*portable*.exe" 2>/dev/null | head -n 1)
        INSTALLER=$(find dist/ -name "*.exe" ! -name "*portable*" 2>/dev/null | head -n 1)

        echo -e "${GREEN}可用版本:${NC}"
        if [ -n "$PORTABLE" ]; then
            echo "  📦 綠色版 (免安裝): $(basename "$PORTABLE")"
        fi
        if [ -n "$INSTALLER" ]; then
            echo "  💿 安裝版: $(basename "$INSTALLER")"
        fi
        echo ""

        echo -e "${YELLOW}提示:${NC}"
        echo "  • 綠色版可直接運行,無需安裝"
        echo "  • 安裝版會創建桌面快捷方式和開始菜單項目"
        echo "  • 將 dist/ 目錄中的 .exe 文件複製到 Windows 電腦運行"
        echo ""

        # 創建 README
        cat > dist/README.txt << EOF
桌面冒險者 - Desktop RPG
========================

遊戲說明:
--------
這是一個透明桌面寵物遊戲,角色會在你的桌面上自由移動。

安裝方式:
--------
方式1 (綠色版):
  - 直接運行 *-portable.exe
  - 無需安裝,可放在任何位置

方式2 (安裝版):
  - 運行安裝程序 .exe (非 portable 版本)
  - 按照提示完成安裝
  - 安裝後可從桌面或開始菜單啟動

遊戲控制:
--------
• 點擊/鍵盤輸入: 獲取銀兩
• 拖曳角色: 移動角色位置
• 點擊角色: 查看角色資訊
• 右下角UI: 開啟遊戲介面

快捷鍵:
-------
• Ctrl+Shift+D: 顯示/隱藏遊戲視窗
• Ctrl+Shift+Q: 退出遊戲

遊戲特色:
--------
• 完全透明背景
• 10個可解鎖角色
• 家園升級系統
• 隨機冒險事件
• 離線掛機收益
• 自動存檔

系統需求:
--------
• Windows 10/11 (64位元)
• 建議 4GB RAM 以上

版本資訊:
--------
版本: 2.0.0
構建日期: $(date '+%Y-%m-%d')

問題反饋:
--------
如遇到問題,請查看錯誤日誌或聯繫開發者。

祝遊戲愉快!
EOF

        echo -e "${GREEN}✓${NC} 已創建 README.txt 說明文件"
        echo ""
    fi

    echo -e "${GREEN}打包完成!${NC}"
    echo "可以將 dist/ 目錄中的文件複製到 Windows 電腦執行"

else
    echo ""
    echo -e "${RED}=================================="
    echo "  打包失敗!"
    echo -e "==================================${NC}"
    echo ""
    echo "請查看上方錯誤訊息"
    exit 1
fi
