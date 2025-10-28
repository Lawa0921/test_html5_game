/**
 * 生成主菜單場景素材佔位符
 *
 * 包含：
 * - 主菜單背景
 * - 按鈕 UI 元素
 * - 其他菜單相關素材
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 顏色常量
const COLORS = {
  PRIMARY_BG: '#1a1a2e',
  SECONDARY_BG: '#16213e',
  ACCENT: '#0f3460',
  HIGHLIGHT: '#e94560',
  TEXT: '#ffffff',
  BORDER: '#3a506b'
};

/**
 * 確保目錄存在
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 添加文字到 canvas（支持多行和自動換行）
 */
function addText(ctx, text, x, y, maxWidth = null, lineHeight = 30) {
  if (maxWidth) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  } else {
    ctx.fillText(text, x, y);
  }
}

/**
 * 生成主菜單背景
 */
function generateMenuBackground() {
  console.log('生成主菜單背景...');

  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 漸層背景
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, COLORS.PRIMARY_BG);
  gradient.addColorStop(0.5, COLORS.SECONDARY_BG);
  gradient.addColorStop(1, COLORS.ACCENT);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 裝飾性圖案
  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;

  // 對角線裝飾
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 150, 0);
    ctx.lineTo(0, i * 150);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - i * 150, height);
    ctx.lineTo(width, height - i * 150);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // 中央裝飾框
  ctx.strokeStyle = COLORS.HIGHLIGHT;
  ctx.lineWidth = 3;
  ctx.strokeRect(width / 2 - 400, 100, 800, 500);

  // 標記文字
  ctx.fillStyle = COLORS.TEXT;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[MENU BACKGROUND]', width / 2, height / 2);

  ctx.font = '16px Arial';
  ctx.fillText('1280 x 720', width / 2, height / 2 + 30);

  // 保存
  const outputPath = path.join(__dirname, '../assets/ui/menu-background.png');
  ensureDir(path.dirname(outputPath));
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ 生成: ${outputPath}`);
}

/**
 * 生成讀取遊戲場景背景
 */
function generateLoadGameBackground() {
  console.log('生成讀取遊戲背景...');

  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 深色背景
  ctx.fillStyle = COLORS.PRIMARY_BG;
  ctx.fillRect(0, 0, width, height);

  // 網格
  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.2;

  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // 標記文字
  ctx.fillStyle = COLORS.TEXT;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[LOAD GAME BACKGROUND]', width / 2, height / 2);

  const outputPath = path.join(__dirname, '../assets/ui/load-game-background.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ 生成: ${outputPath}`);
}

/**
 * 生成選項場景背景
 */
function generateOptionsBackground() {
  console.log('生成選項場景背景...');

  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 漸層背景
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height);
  gradient.addColorStop(0, COLORS.SECONDARY_BG);
  gradient.addColorStop(1, COLORS.PRIMARY_BG);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 圓形裝飾
  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.2;

  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, i * 100, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // 標記文字
  ctx.fillStyle = COLORS.TEXT;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[OPTIONS BACKGROUND]', width / 2, height / 2);

  const outputPath = path.join(__dirname, '../assets/ui/options-background.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ 生成: ${outputPath}`);
}

/**
 * 生成存檔槽位卡片
 */
function generateSaveSlotCard() {
  console.log('生成存檔槽位卡片...');

  const width = 360;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = COLORS.SECONDARY_BG;
  ctx.fillRect(0, 0, width, height);

  // 邊框
  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, width, height);

  // 標記
  ctx.fillStyle = COLORS.TEXT;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[SAVE SLOT CARD]', width / 2, height / 2 - 20);

  ctx.font = '12px Arial';
  ctx.fillText('360 x 200', width / 2, height / 2 + 10);

  const outputPath = path.join(__dirname, '../assets/ui/save-slot-card.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ 生成: ${outputPath}`);
}

/**
 * 生成空存檔槽位
 */
function generateEmptySlotCard() {
  console.log('生成空存檔槽位...');

  const width = 360;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = COLORS.PRIMARY_BG;
  ctx.fillRect(0, 0, width, height);

  // 虛線邊框
  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  ctx.strokeRect(5, 5, width - 10, height - 10);
  ctx.setLineDash([]);

  // 標記
  ctx.fillStyle = COLORS.TEXT;
  ctx.globalAlpha = 0.5;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[EMPTY SLOT]', width / 2, height / 2);

  ctx.globalAlpha = 1.0;

  const outputPath = path.join(__dirname, '../assets/ui/empty-slot-card.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ 生成: ${outputPath}`);
}

/**
 * 生成開場劇情背景（暫時佔位）
 */
function generateIntroBackground() {
  console.log('生成開場劇情背景...');

  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 深色背景
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // 暗角效果
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, height);
  gradient.addColorStop(0, 'rgba(30,30,30,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 標記文字
  ctx.fillStyle = COLORS.TEXT;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[INTRO STORY BACKGROUND]', width / 2, height / 2);

  ctx.font = '16px Arial';
  ctx.fillText('開場劇情背景', width / 2, height / 2 + 40);

  const outputPath = path.join(__dirname, '../assets/scenes/intro/intro-background.png');
  ensureDir(path.dirname(outputPath));
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ 生成: ${outputPath}`);
}

// 主函數
function main() {
  console.log('='.repeat(50));
  console.log('開始生成主菜單場景素材佔位符');
  console.log('='.repeat(50));
  console.log('');

  try {
    // 生成各種素材
    generateMenuBackground();
    generateLoadGameBackground();
    generateOptionsBackground();
    generateSaveSlotCard();
    generateEmptySlotCard();
    generateIntroBackground();

    console.log('');
    console.log('='.repeat(50));
    console.log('✓ 所有主菜單素材已生成完成！');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('生成失敗：', error);
    process.exit(1);
  }
}

// 執行
if (require.main === module) {
  main();
}

module.exports = {
  generateMenuBackground,
  generateLoadGameBackground,
  generateOptionsBackground,
  generateSaveSlotCard,
  generateEmptySlotCard,
  generateIntroBackground
};
