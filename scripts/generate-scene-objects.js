#!/usr/bin/env node

/**
 * 生成場景物件圖標
 * 包含：廚房物件（10）、儲藏室物件（10）、房間物件（10）
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   場景物件圖標生成器                   ║');
console.log('╚═══════════════════════════════════════╝\n');

// 確保目錄存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 生成場景物件圖標
function generateSceneObject(size, bgColor, objectName, emoji, isInteractive = true) {
    const interactiveBorder = isInteractive ? '#FFD700' : '#999999';
    const interactiveGlow = isInteractive
        ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.45}"
                  fill="none" stroke="#FFD700" stroke-width="2"
                  opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.6;0.3"
                     dur="2s" repeatCount="indefinite"/>
          </circle>`
        : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="objGradient_${objectName}">
      <stop offset="0%" style="stop-color:${adjustBrightness(bgColor, 20)};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bgColor};stop-opacity:1" />
    </radialGradient>
    <filter id="shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="2" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 背景圓形 -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.45}"
          fill="url(#objGradient_${objectName})"
          filter="url(#shadow)"/>

  <!-- 可互動提示邊框 -->
  ${interactiveGlow}

  <!-- 物件表情符號 -->
  <text x="${size / 2}" y="${size * 0.58}" text-anchor="middle"
        font-size="${size * 0.5}">${emoji}</text>

  <!-- 物件名稱 -->
  <text x="${size / 2}" y="${size - 8}" text-anchor="middle"
        font-family="Arial" font-size="12" font-weight="bold"
        fill="#333">${objectName}</text>
</svg>`;
}

// 調整顏色亮度
function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ==================== 主要生成邏輯 ====================

const baseDir = path.join(__dirname, '../assets/objects');
ensureDir(baseDir);

// 廚房物件
const kitchenObjects = [
    { name: 'stove', label: '灶台', emoji: '🔥', color: '#FF6B35', interactive: true },
    { name: 'cutting_board', label: '砧板', emoji: '🔪', color: '#8D6E63', interactive: true },
    { name: 'wok', label: '鐵鍋', emoji: '🍳', color: '#424242', interactive: true },
    { name: 'pot', label: '陶罐', emoji: '🏺', color: '#D4A373', interactive: true },
    { name: 'knife_set', label: '刀具架', emoji: '🔪', color: '#757575', interactive: true },
    { name: 'spice_rack', label: '調料架', emoji: '🧂', color: '#A1887F', interactive: true },
    { name: 'water_bucket', label: '水桶', emoji: '🪣', color: '#78909C', interactive: true },
    { name: 'firewood', label: '柴火堆', emoji: '🪵', color: '#6D4C41', interactive: false },
    { name: 'bamboo_steamer', label: '蒸籠', emoji: '🥟', color: '#C8A882', interactive: true },
    { name: 'oil_jar', label: '油罐', emoji: '🛢️', color: '#FFA726', interactive: true }
];

// 儲藏室物件
const storageObjects = [
    { name: 'rice_jar', label: '米缸', emoji: '🌾', color: '#F5DEB3', interactive: true },
    { name: 'wine_jar', label: '酒罈', emoji: '🍶', color: '#8B4513', interactive: true },
    { name: 'tea_chest', label: '茶箱', emoji: '🍵', color: '#8BC34A', interactive: true },
    { name: 'medicine_cabinet', label: '藥櫃', emoji: '💊', color: '#66BB6A', interactive: true },
    { name: 'fabric_roll', label: '布匹', emoji: '🧵', color: '#E1BEE7', interactive: true },
    { name: 'tool_box', label: '工具箱', emoji: '🧰', color: '#FF7043', interactive: true },
    { name: 'cash_box', label: '錢箱', emoji: '💰', color: '#FFD700', interactive: true },
    { name: 'account_books', label: '帳簿', emoji: '📒', color: '#8D6E63', interactive: true },
    { name: 'seal_box', label: '印章盒', emoji: '📮', color: '#D32F2F', interactive: true },
    { name: 'scroll_rack', label: '卷軸架', emoji: '📜', color: '#A1887F', interactive: true }
];

// 房間物件
const roomObjects = [
    { name: 'bed', label: '床鋪', emoji: '🛏️', color: '#BCAAA4', interactive: true },
    { name: 'table', label: '桌子', emoji: '🪑', color: '#8D6E63', interactive: true },
    { name: 'chair', label: '椅子', emoji: '🪑', color: '#A1887F', interactive: true },
    { name: 'dresser', label: '梳妝台', emoji: '💄', color: '#F8BBD0', interactive: true },
    { name: 'wardrobe', label: '衣櫃', emoji: '👘', color: '#9575CD', interactive: true },
    { name: 'incense_burner', label: '香爐', emoji: '🕯️', color: '#D4A373', interactive: true },
    { name: 'tea_set', label: '茶具', emoji: '🍵', color: '#81C784', interactive: true },
    { name: 'zither', label: '古琴', emoji: '🎵', color: '#8D6E63', interactive: true },
    { name: 'bookshelf', label: '書架', emoji: '📚', color: '#6D4C41', interactive: true },
    { name: 'screen', label: '屏風', emoji: '🖼️', color: '#C5E1A5', interactive: false }
];

const categories = [
    { name: 'kitchen', label: '廚房', objects: kitchenObjects },
    { name: 'storage', label: '儲藏室', objects: storageObjects },
    { name: 'room', label: '房間', objects: roomObjects }
];

let totalGenerated = 0;

categories.forEach(category => {
    console.log(`\n📂 生成${category.label}物件 (${category.objects.length} 個):`);
    console.log('─'.repeat(60));

    const categoryDir = path.join(baseDir, category.name);
    ensureDir(categoryDir);

    category.objects.forEach(obj => {
        const fileName = `obj_${obj.name}.svg`;
        const filePath = path.join(categoryDir, fileName);

        const svg = generateSceneObject(
            64,
            obj.color,
            obj.label,
            obj.emoji,
            obj.interactive
        );

        fs.writeFileSync(filePath, svg);
        totalGenerated++;

        const interactiveLabel = obj.interactive ? '[可互動]' : '[裝飾]';
        console.log(`  ✓ ${fileName.padEnd(25)} - ${obj.label.padEnd(8)} ${interactiveLabel}`);
    });
});

// ==================== 總結 ====================

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   生成完成                             ║');
console.log('╚═══════════════════════════════════════╝\n');

console.log(`✅ 共生成 ${totalGenerated} 個場景物件圖標`);
console.log('\n📂 生成位置:');
categories.forEach(category => {
    console.log(`  • ${path.join(baseDir, category.name)} (${category.objects.length} 個)`);
});

// 統計互動物件
const totalInteractive = [...kitchenObjects, ...storageObjects, ...roomObjects]
    .filter(obj => obj.interactive).length;
console.log(`\n📊 互動性統計:`);
console.log(`  可互動物件: ${totalInteractive} 個`);
console.log(`  裝飾物件: ${totalGenerated - totalInteractive} 個`);

console.log('\n✨ Phase 1 核心資源生成完成！');
console.log('   已生成: 戰鬥UI (14) + 任務物品 (13) + 場景物件 (30) = 57 個文件');
