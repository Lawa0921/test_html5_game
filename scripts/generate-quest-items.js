#!/usr/bin/env node

/**
 * 生成任務物品圖標
 * 包含：13 個劇情相關的任務道具
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   任務物品圖標生成器                   ║');
console.log('╚═══════════════════════════════════════╝\n');

// 確保目錄存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 生成任務物品圖標
function generateQuestItem(size, bgColor, itemName, emoji, rarity = 'common') {
    // 根據稀有度設定邊框顏色
    const borderColors = {
        common: '#9E9E9E',    // 灰色
        uncommon: '#4CAF50',  // 綠色
        rare: '#2196F3',      // 藍色
        epic: '#9C27B0',      // 紫色
        legendary: '#FF9800'  // 橙色
    };

    const borderColor = borderColors[rarity] || borderColors.common;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient_${itemName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -30)};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="shine">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </radialGradient>
  </defs>

  <!-- 外框陰影 -->
  <rect x="4" y="4" width="${size - 8}" height="${size - 8}"
        fill="#000" opacity="0.3" rx="12"/>

  <!-- 背景 -->
  <rect width="${size}" height="${size}"
        fill="url(#bgGradient_${itemName})" rx="12"/>

  <!-- 稀有度邊框 -->
  <rect x="2" y="2" width="${size - 4}" height="${size - 4}"
        fill="none" stroke="${borderColor}" stroke-width="4" rx="10"/>

  <!-- 內框光澤 -->
  <rect x="6" y="6" width="${size - 12}" height="${size - 12}"
        fill="none" stroke="${adjustBrightness(borderColor, 50)}"
        stroke-width="1" rx="8" opacity="0.6"/>

  <!-- 光澤效果 -->
  <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.4}"
          fill="url(#shine)"/>

  <!-- 表情符號/圖標 -->
  <text x="${size / 2}" y="${size * 0.55}" text-anchor="middle"
        font-size="${size * 0.5}" filter="url(#glow)">${emoji}</text>

  <!-- 物品名稱 -->
  <text x="${size / 2}" y="${size - 12}" text-anchor="middle"
        font-family="Arial" font-size="14" font-weight="bold"
        fill="#fff" stroke="#000" stroke-width="0.5">${itemName}</text>
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

const questDir = path.join(__dirname, '../assets/items/quest');
ensureDir(questDir);

// 任務物品列表
const questItems = [
    {
        name: 'qin_jade',
        label: '秦家玉佩',
        emoji: '💎',
        color: '#4DB8E8',
        rarity: 'rare',
        description: '秦婉柔的家傳玉佩，證明秦家血統'
    },
    {
        name: 'lin_genealogy',
        label: '林家家譜',
        emoji: '📜',
        color: '#8D6E63',
        rarity: 'rare',
        description: '林家的族譜，記載家族歷史'
    },
    {
        name: 'yue_token',
        label: '岳家軍令牌',
        emoji: '🎖️',
        color: '#FFB300',
        rarity: 'epic',
        description: '岳飛後人的信物，象徵武將傳承'
    },
    {
        name: 'medical_herbs',
        label: '珍貴藥材',
        emoji: '🌿',
        color: '#66BB6A',
        rarity: 'uncommon',
        description: '罕見的藥草，可治療重症'
    },
    {
        name: 'ancient_scroll',
        label: '古籍殘卷',
        emoji: '📖',
        color: '#D4A373',
        rarity: 'rare',
        description: '古老的典籍殘卷，蘊含失傳知識'
    },
    {
        name: 'love_letter',
        label: '情書',
        emoji: '💌',
        color: '#F48FB1',
        rarity: 'common',
        description: '一封情意綿綿的書信'
    },
    {
        name: 'cooking_recipe',
        label: '祖傳食譜',
        emoji: '📝',
        color: '#FFA726',
        rarity: 'uncommon',
        description: '林家祖傳的烹飪秘方'
    },
    {
        name: 'mysterious_box',
        label: '神秘盒子',
        emoji: '📦',
        color: '#7E57C2',
        rarity: 'epic',
        description: '無法打開的神秘盒子'
    },
    {
        name: 'tavern_deed',
        label: '客棧地契',
        emoji: '🏠',
        color: '#A1887F',
        rarity: 'rare',
        description: '客棧的所有權證明'
    },
    {
        name: 'silver_hairpin',
        label: '銀簪',
        emoji: '💍',
        color: '#E0E0E0',
        rarity: 'uncommon',
        description: '精緻的銀製髮簪'
    },
    {
        name: 'music_score',
        label: '樂譜',
        emoji: '🎵',
        color: '#81C784',
        rarity: 'uncommon',
        description: '蘇妙音的古曲樂譜'
    },
    {
        name: 'martial_manual',
        label: '武功秘籍',
        emoji: '📕',
        color: '#EF5350',
        rarity: 'epic',
        description: '失傳已久的武學典籍'
    },
    {
        name: 'poison_antidote',
        label: '解毒劑',
        emoji: '🧪',
        color: '#26A69A',
        rarity: 'rare',
        description: '能解百毒的靈藥'
    }
];

console.log('開始生成任務物品圖標...\n');

let totalGenerated = 0;

questItems.forEach((item, index) => {
    const fileName = `quest_${item.name}.svg`;
    const filePath = path.join(questDir, fileName);

    const svg = generateQuestItem(
        128,
        item.color,
        item.label,
        item.emoji,
        item.rarity
    );

    fs.writeFileSync(filePath, svg);
    totalGenerated++;

    const rarityLabel = {
        common: '普通',
        uncommon: '優良',
        rare: '稀有',
        epic: '史詩',
        legendary: '傳說'
    }[item.rarity];

    console.log(`✓ ${fileName.padEnd(30)} - ${item.label.padEnd(10)} [${rarityLabel}]`);
    console.log(`  ${item.description}`);
});

// ==================== 總結 ====================

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   生成完成                             ║');
console.log('╚═══════════════════════════════════════╝\n');

console.log(`✅ 共生成 ${totalGenerated} 個任務物品圖標`);
console.log(`📂 生成位置: ${questDir}`);
console.log('\n📊 稀有度分布:');

const rarityCounts = questItems.reduce((acc, item) => {
    acc[item.rarity] = (acc[item.rarity] || 0) + 1;
    return acc;
}, {});

Object.entries(rarityCounts).forEach(([rarity, count]) => {
    const label = {
        common: '普通',
        uncommon: '優良',
        rare: '稀有',
        epic: '史詩',
        legendary: '傳說'
    }[rarity];
    console.log(`  ${label}: ${count} 個`);
});

console.log('\n✨ 下一步: npm run assets:scenes (生成場景物件)');
