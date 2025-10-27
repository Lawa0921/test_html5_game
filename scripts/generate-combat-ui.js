#!/usr/bin/env node

/**
 * 生成戰鬥系統 UI 資源
 * 包含：生命條、戰鬥背景、敵人圖像、技能圖標、Buff/Debuff 圖標
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   戰鬥系統 UI 資源生成器              ║');
console.log('╚═══════════════════════════════════════╝\n');

// 確保目錄存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 生成生命條
function generateHealthBar(width, height) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ff4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#cc0000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 背景邊框 -->
  <rect width="${width}" height="${height}" fill="#333" rx="3"/>
  <!-- 內部背景 -->
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="#111" rx="2"/>
  <!-- 生命條 (滿血狀態) -->
  <rect x="3" y="3" width="${width - 6}" height="${height - 6}" fill="url(#healthGradient)" rx="2"/>
</svg>`;
}

// 生成戰鬥背景
function generateCombatBackground(width, height) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGradient">
      <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  <!-- 戰鬥氛圍裝飾 -->
  <g opacity="0.3">
    <line x1="0" y1="${height * 0.6}" x2="${width}" y2="${height * 0.6}"
          stroke="#8B4513" stroke-width="3"/>
    <line x1="0" y1="${height * 0.62}" x2="${width}" y2="${height * 0.62}"
          stroke="#654321" stroke-width="2"/>
  </g>
  <!-- 戰鬥文字 -->
  <text x="${width / 2}" y="80" text-anchor="middle"
        font-family="Arial" font-size="48" font-weight="bold"
        fill="#ff6666" opacity="0.7">戰鬥場景</text>
</svg>`;
}

// 生成敵人圖像
function generateEnemy(size, color, name, symbol) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="enemyGradient_${name}">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(color, -40)};stop-opacity:1" />
    </radialGradient>
  </defs>
  <!-- 陰影 -->
  <ellipse cx="${size / 2}" cy="${size * 0.85}" rx="${size * 0.4}" ry="${size * 0.1}"
           fill="#000" opacity="0.3"/>
  <!-- 敵人主體 -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}"
          fill="url(#enemyGradient_${name})" stroke="#000" stroke-width="3"/>
  <!-- 符號/表情 -->
  <text x="${size / 2}" y="${size / 2 + 10}" text-anchor="middle"
        font-size="${size * 0.3}" fill="#fff">${symbol}</text>
  <!-- 名稱 -->
  <text x="${size / 2}" y="${size - 10}" text-anchor="middle"
        font-size="16" font-weight="bold" fill="#fff">${name}</text>
</svg>`;
}

// 生成技能圖標
function generateSkillIcon(size, color, name, symbol) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skillGradient_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(color, -30)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 背景 -->
  <rect width="${size}" height="${size}" fill="url(#skillGradient_${name})"
        rx="8" stroke="#333" stroke-width="2"/>
  <!-- 內框 -->
  <rect x="4" y="4" width="${size - 8}" height="${size - 8}"
        fill="none" stroke="${adjustBrightness(color, 30)}"
        stroke-width="1" rx="6" opacity="0.5"/>
  <!-- 符號 -->
  <text x="${size / 2}" y="${size / 2 + 8}" text-anchor="middle"
        font-size="${size * 0.5}" fill="#fff">${symbol}</text>
</svg>`;
}

// 生成狀態圖標 (Buff/Debuff)
function generateStatusIcon(size, color, name, symbol, isBuff = true) {
    const borderColor = isBuff ? '#4CAF50' : '#f44336';
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="statusGradient_${name}">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(color, -40)};stop-opacity:1" />
    </radialGradient>
  </defs>
  <!-- 背景 -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
          fill="url(#statusGradient_${name})" stroke="${borderColor}" stroke-width="2"/>
  <!-- 符號 -->
  <text x="${size / 2}" y="${size / 2 + 6}" text-anchor="middle"
        font-size="${size * 0.5}" fill="#fff">${symbol}</text>
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

let totalGenerated = 0;

// 1. 生成生命條
console.log('生成生命條...');
const healthBarDir = path.join(__dirname, '../assets/ui/combat');
ensureDir(healthBarDir);
fs.writeFileSync(
    path.join(healthBarDir, 'ui_health_bar.svg'),
    generateHealthBar(200, 20)
);
totalGenerated++;
console.log('✓ ui_health_bar.svg (200×20px)');

// 2. 生成戰鬥背景
console.log('\n生成戰鬥背景...');
fs.writeFileSync(
    path.join(healthBarDir, 'ui_combat_bg.svg'),
    generateCombatBackground(1920, 1080)
);
totalGenerated++;
console.log('✓ ui_combat_bg.svg (1920×1080px)');

// 3. 生成敵人圖像
console.log('\n生成敵人圖像...');
const enemiesDir = path.join(__dirname, '../assets/enemies');
ensureDir(enemiesDir);

const enemies = [
    { name: 'robber', label: '強盜', color: '#8B4513', symbol: '🗡️' },
    { name: 'drunk', label: '醉漢', color: '#CD853F', symbol: '🍺' },
    { name: 'beast', label: '野獸', color: '#696969', symbol: '🐺' },
    { name: 'soldier', label: '士兵', color: '#4682B4', symbol: '⚔️' }
];

enemies.forEach(enemy => {
    fs.writeFileSync(
        path.join(enemiesDir, `enemy_${enemy.name}.svg`),
        generateEnemy(256, enemy.color, enemy.label, enemy.symbol)
    );
    totalGenerated++;
    console.log(`✓ enemy_${enemy.name}.svg (256×256px) - ${enemy.label}`);
});

// 4. 生成技能圖標
console.log('\n生成技能圖標...');
const skillsDir = path.join(healthBarDir, 'skills');
ensureDir(skillsDir);

const skills = [
    { name: 'attack', label: '攻擊', color: '#ff4444', symbol: '⚔' },
    { name: 'defend', label: '防禦', color: '#4444ff', symbol: '🛡' },
    { name: 'heal', label: '治療', color: '#44ff44', symbol: '💚' }
];

skills.forEach(skill => {
    fs.writeFileSync(
        path.join(skillsDir, `skill_${skill.name}.svg`),
        generateSkillIcon(64, skill.color, skill.name, skill.symbol)
    );
    totalGenerated++;
    console.log(`✓ skill_${skill.name}.svg (64×64px) - ${skill.label}`);
});

// 5. 生成 Buff 圖標
console.log('\n生成 Buff 圖標...');
const buffsDir = path.join(healthBarDir, 'buffs');
ensureDir(buffsDir);

const buffs = [
    { name: 'strength', label: '力量', color: '#ff6b6b', symbol: '💪' },
    { name: 'defense', label: '防禦', color: '#4dabf7', symbol: '🛡️' },
    { name: 'speed', label: '速度', color: '#51cf66', symbol: '⚡' }
];

buffs.forEach(buff => {
    fs.writeFileSync(
        path.join(buffsDir, `buff_${buff.name}.svg`),
        generateStatusIcon(32, buff.color, buff.name, buff.symbol, true)
    );
    totalGenerated++;
    console.log(`✓ buff_${buff.name}.svg (32×32px) - ${buff.label}`);
});

// 6. 生成 Debuff 圖標
console.log('\n生成 Debuff 圖標...');
const debuffs = [
    { name: 'poison', label: '中毒', color: '#8e44ad', symbol: '☠️' },
    { name: 'stun', label: '暈眩', color: '#f39c12', symbol: '💫' }
];

debuffs.forEach(debuff => {
    fs.writeFileSync(
        path.join(buffsDir, `debuff_${debuff.name}.svg`),
        generateStatusIcon(32, debuff.color, debuff.name, debuff.symbol, false)
    );
    totalGenerated++;
    console.log(`✓ debuff_${debuff.name}.svg (32×32px) - ${debuff.label}`);
});

// ==================== 總結 ====================

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   生成完成                             ║');
console.log('╚═══════════════════════════════════════╝\n');

console.log(`✅ 共生成 ${totalGenerated} 個戰鬥系統 UI 資源`);
console.log('\n📂 生成位置:');
console.log(`  • ${healthBarDir}`);
console.log(`  • ${enemiesDir}`);
console.log(`  • ${skillsDir}`);
console.log(`  • ${buffsDir}`);

console.log('\n✨ 下一步: npm run assets:quest (生成任務物品)');
