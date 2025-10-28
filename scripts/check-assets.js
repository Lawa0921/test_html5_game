/**
 * 素材檢查腳本
 * 檢查哪些素材仍是佔位符，哪些已經被替換成真實素材
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// ANSI 顏色碼
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// 素材清單（從生成腳本中提取）
const assetCategories = {
  '開場劇情場景': {
    backgrounds: [
      'assets/scenes/intro/inn-exterior-rundown.png',
      'assets/scenes/intro/inn-interior-abandoned.png'
    ],
    portraits: [
      'assets/portraits/001-linxiuran-neutral.png',
      'assets/portraits/002-linyuyan-neutral.png',
      'assets/portraits/001-linxiuran-surprised.png',
      'assets/portraits/002-linyuyan-smile.png'
    ],
    ui: [
      'assets/ui/dialogue-box.png',
      'assets/ui/button-continue.png',
      'assets/ui/button-skip.png'
    ]
  },
  '工作分配場景': {
    backgrounds: ['assets/scenes/work-assignment/background.png'],
    avatars: [
      'assets/avatars/001-linxiuran.png',
      'assets/avatars/002-linyuyan.png',
      'assets/avatars/011-qinwanrou.png'
    ],
    icons: [
      'assets/icons/jobs/cooking-icon.png',
      'assets/icons/jobs/serving-icon.png',
      'assets/icons/jobs/cleaning-icon.png',
      'assets/icons/jobs/accounting-icon.png',
      'assets/icons/jobs/greeting-icon.png',
      'assets/icons/jobs/security-icon.png',
      'assets/icons/jobs/prep-icon.png',
      'assets/icons/jobs/performing-icon.png'
    ]
  },
  '主遊戲場景': {
    backgrounds: [
      'assets/scenes/main-game/lobby.png',
      'assets/scenes/main-game/kitchen.png',
      'assets/scenes/main-game/rooms.png',
      'assets/scenes/main-game/backyard.png'
    ],
    npcs: [
      'assets/sprites/npcs/guest-01-walk.png',
      'assets/sprites/npcs/guest-02-walk.png',
      'assets/sprites/npcs/guest-03-walk.png',
      'assets/sprites/npcs/guest-vip-walk.png'
    ],
    hud: [
      'assets/ui/hud-top-bar.png',
      'assets/ui/icon-gold.png',
      'assets/ui/icon-reputation.png',
      'assets/ui/icon-time.png'
    ]
  },
  '結算場景': {
    backgrounds: ['assets/scenes/settlement/background.png'],
    ui: [
      'assets/scenes/settlement/settlement-panel.png',
      'assets/scenes/settlement/icon-income.png',
      'assets/scenes/settlement/icon-expense.png'
    ]
  },
  '夜晚場景': {
    backgrounds: [
      'assets/scenes/night/inn-interior-night.png',
      'assets/scenes/night/courtyard-night.png'
    ],
    ui: [
      'assets/ui/card-chat.png',
      'assets/ui/card-learning.png',
      'assets/ui/button-sleep.png',
      'assets/ui/affection-bar.png'
    ]
  }
};

// 檢查圖片是否為佔位符
async function isPlaceholder(imagePath) {
  try {
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // 檢查中心點顏色變化
    // 佔位符通常是純色背景 + 文字
    const centerX = Math.floor(img.width / 2);
    const centerY = Math.floor(img.height / 2);
    const centerPixel = ctx.getImageData(centerX, centerY, 1, 1).data;

    // 檢查邊角顏色
    const corner1 = ctx.getImageData(10, 10, 1, 1).data;
    const corner2 = ctx.getImageData(img.width - 10, 10, 1, 1).data;

    // 如果邊角和中心顏色非常接近，且有黑色邊框（佔位符特徵）
    const colorSimilarity = (c1, c2) => {
      return Math.abs(c1[0] - c2[0]) + Math.abs(c1[1] - c2[1]) + Math.abs(c1[2] - c2[2]);
    };

    // 檢查是否有黑色邊框（佔位符的特徵）
    const topLeftPixel = ctx.getImageData(0, 0, 1, 1).data;
    const isBlackBorder = topLeftPixel[0] === 0 && topLeftPixel[1] === 0 && topLeftPixel[2] === 0;

    return isBlackBorder && colorSimilarity(corner1, corner2) < 50;
  } catch (error) {
    return null; // 無法判斷
  }
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// 主檢查函數
async function checkAssets() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║           遊戲流程素材檢核報告                             ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  let totalAssets = 0;
  let existingAssets = 0;
  let placeholderAssets = 0;
  let realAssets = 0;
  let missingAssets = 0;

  for (const [category, subcategories] of Object.entries(assetCategories)) {
    console.log(`\n${colors.yellow}▶ ${category}${colors.reset}`);
    console.log(`${'─'.repeat(60)}`);

    for (const [subcategory, files] of Object.entries(subcategories)) {
      console.log(`\n  ${colors.cyan}${subcategory}:${colors.reset}`);

      for (const file of files) {
        totalAssets++;
        const filePath = path.join(process.cwd(), file);
        const fileName = path.basename(file);

        if (!fs.existsSync(filePath)) {
          console.log(`    ${colors.red}✗${colors.reset} ${fileName} ${colors.gray}(缺失)${colors.reset}`);
          missingAssets++;
          continue;
        }

        existingAssets++;
        const stats = fs.statSync(filePath);
        const size = formatSize(stats.size);

        const isPlaceholderImage = await isPlaceholder(filePath);

        if (isPlaceholderImage === null) {
          console.log(`    ${colors.yellow}?${colors.reset} ${fileName} ${colors.gray}(${size}, 無法判斷)${colors.reset}`);
        } else if (isPlaceholderImage) {
          console.log(`    ${colors.yellow}⚠${colors.reset} ${fileName} ${colors.gray}(${size}, 佔位符)${colors.reset}`);
          placeholderAssets++;
        } else {
          console.log(`    ${colors.green}✓${colors.reset} ${fileName} ${colors.gray}(${size}, 真實素材)${colors.reset}`);
          realAssets++;
        }
      }
    }
  }

  // 檢查音效文件
  console.log(`\n${colors.yellow}▶ 音效素材${colors.reset}`);
  console.log(`${'─'.repeat(60)}`);

  const audioFiles = [
    'assets/audio/bgm/intro-story.mp3',
    'assets/audio/bgm/work-assignment.mp3',
    'assets/audio/bgm/day-operation.mp3',
    'assets/audio/bgm/settlement.mp3',
    'assets/audio/bgm/night-time.mp3',
    'assets/audio/sfx/click.mp3',
    'assets/audio/sfx/confirm.mp3',
    'assets/audio/sfx/coin.mp3'
  ];

  audioFiles.forEach(file => {
    totalAssets++;
    const filePath = path.join(process.cwd(), file);
    const fileName = path.basename(file);

    if (!fs.existsSync(filePath)) {
      console.log(`  ${colors.red}✗${colors.reset} ${fileName} ${colors.gray}(缺失)${colors.reset}`);
      missingAssets++;
    } else {
      existingAssets++;
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');

      if (content.includes('placeholder')) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${fileName} ${colors.gray}(佔位符)${colors.reset}`);
        placeholderAssets++;
      } else {
        const size = formatSize(stats.size);
        console.log(`  ${colors.green}✓${colors.reset} ${fileName} ${colors.gray}(${size}, 真實素材)${colors.reset}`);
        realAssets++;
      }
    }
  });

  // 統計報告
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                      統計報告                              ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const completeRate = ((realAssets / totalAssets) * 100).toFixed(2);
  const existRate = ((existingAssets / totalAssets) * 100).toFixed(2);

  console.log(`  總素材數：        ${totalAssets}`);
  console.log(`  ${colors.green}✓ 真實素材：      ${realAssets} (${completeRate}%)${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ 佔位符：        ${placeholderAssets}${colors.reset}`);
  console.log(`  ${colors.red}✗ 缺失：          ${missingAssets}${colors.reset}`);
  console.log(`  ${colors.gray}存在率：          ${existRate}%${colors.reset}`);

  // 進度條
  const barLength = 50;
  const filledLength = Math.floor((realAssets / totalAssets) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  console.log(`\n  完成度：[${colors.green}${bar}${colors.reset}] ${completeRate}%\n`);

  // 提醒
  if (placeholderAssets > 0) {
    console.log(`${colors.yellow}⚠ 注意：還有 ${placeholderAssets} 個佔位符需要替換為真實素材${colors.reset}`);
  }

  if (missingAssets > 0) {
    console.log(`${colors.red}✗ 警告：有 ${missingAssets} 個素材缺失！${colors.reset}`);
  }

  if (realAssets === totalAssets) {
    console.log(`${colors.green}✓ 恭喜！所有素材已準備完成！${colors.reset}\n`);
  }
}

// 執行檢查
checkAssets().catch(error => {
  console.error(`${colors.red}檢查過程發生錯誤：${error.message}${colors.reset}`);
  process.exit(1);
});
