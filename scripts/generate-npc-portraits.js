#!/usr/bin/env node

/**
 * 生成 NPC 肖像和頭像佔位符
 * 為 employeeTemplates.js 中引用的 NPC 角色生成資源
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   NPC 肖像佔位符生成器                 ║');
console.log('╚═══════════════════════════════════════╝\n');

// 確保目錄存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 生成肖像佔位符 (portrait - 較大的立繪)
function generatePortrait(type, name, realName, color) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg_${type}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${adjustBrightness(color, 20)};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
    </linearGradient>
    <radialGradient id="face_${type}">
      <stop offset="0%" style="stop-color:#FFE4C4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DEB887;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- 背景 -->
  <rect width="300" height="400" fill="url(#bg_${type})" />

  <!-- 角色輪廓 -->
  <ellipse cx="150" cy="180" rx="80" ry="100" fill="url(#face_${type})" />

  <!-- 頭部 -->
  <circle cx="150" cy="120" r="60" fill="url(#face_${type})" />

  <!-- 眼睛 -->
  <circle cx="135" cy="115" r="5" fill="#000" />
  <circle cx="165" cy="115" r="5" fill="#000" />

  <!-- 嘴巴 -->
  <path d="M 135 135 Q 150 145 165 135" stroke="#000" stroke-width="2" fill="none" />

  <!-- 職位標籤 -->
  <rect x="50" y="320" width="200" height="60" rx="10" fill="rgba(0,0,0,0.7)" />
  <text x="150" y="345" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="${color}">
    ${name}
  </text>
  <text x="150" y="370" text-anchor="middle" font-family="Arial" font-size="16" fill="#FFF">
    ${realName}
  </text>
</svg>`;
}

// 生成頭像佔位符 (avatar - 小圖標)
function generateAvatar(type, name, color) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="avatar_bg_${type}">
      <stop offset="0%" style="stop-color:${adjustBrightness(color, 30)};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
    </radialGradient>
    <radialGradient id="avatar_face_${type}">
      <stop offset="0%" style="stop-color:#FFE4C4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DEB887;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- 背景圓 -->
  <circle cx="32" cy="32" r="30" fill="url(#avatar_bg_${type})" />

  <!-- 頭部 -->
  <circle cx="32" cy="28" r="15" fill="url(#avatar_face_${type})" />

  <!-- 身體 -->
  <ellipse cx="32" cy="48" rx="18" ry="12" fill="url(#avatar_face_${type})" />

  <!-- 眼睛 -->
  <circle cx="28" cy="26" r="2" fill="#000" />
  <circle cx="36" cy="26" r="2" fill="#000" />

  <!-- 標籤 -->
  <text x="32" y="58" text-anchor="middle" font-family="Arial" font-size="8" font-weight="bold" fill="#FFF">
    ${name}
  </text>
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

// NPC 角色列表（來自 employeeTemplates.js）
const npcCharacters = [
    { type: 'chef', name: '廚師', realName: '孟四娘', color: '#FF6347' },
    { type: 'runner', name: '跑堂', realName: '林小風', color: '#87CEEB' },
    { type: 'herbalist', name: '藥師', realName: '顧青崖', color: '#90EE90' },
    { type: 'storyteller', name: '說書人', realName: '方無忌', color: '#D2691E' },
    { type: 'musician', name: '樂師', realName: '蘇妙音', color: '#DDA0DD' },
    { type: 'accountant', name: '賬房', realName: '李默然', color: '#708090' },
    { type: 'doorman', name: '門童', realName: '翠兒', color: '#FFB6C1' }
];

const baseDir = path.join(__dirname, '../assets/characters/npc');
ensureDir(baseDir);

let totalGenerated = 0;

console.log('開始生成 NPC 肖像...\n');

npcCharacters.forEach((npc, index) => {
    console.log(`[${index + 1}/${npcCharacters.length}] 生成 ${npc.name} (${npc.realName})...`);

    // 生成肖像
    const portraitPath = path.join(baseDir, `${npc.type}_portrait.svg`);
    const portraitSvg = generatePortrait(npc.type, npc.name, npc.realName, npc.color);
    fs.writeFileSync(portraitPath, portraitSvg);
    console.log(`  ✓ 肖像: ${npc.type}_portrait.svg`);
    totalGenerated++;

    // 生成頭像
    const avatarPath = path.join(baseDir, `${npc.type}_avatar.svg`);
    const avatarSvg = generateAvatar(npc.type, npc.name, npc.color);
    fs.writeFileSync(avatarPath, avatarSvg);
    console.log(`  ✓ 頭像: ${npc.type}_avatar.svg`);
    totalGenerated++;
});

// ==================== 總結 ====================

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   生成完成                             ║');
console.log('╚═══════════════════════════════════════╝\n');

console.log(`✅ 共生成 ${totalGenerated} 個 NPC 資源`);
console.log(`   - ${npcCharacters.length} 個肖像 (portrait)`);
console.log(`   - ${npcCharacters.length} 個頭像 (avatar)`);

console.log(`\n📂 生成位置: ${baseDir}`);
console.log('\n📋 生成的 NPC:');
npcCharacters.forEach(npc => {
    console.log(`   • ${npc.name} (${npc.realName}) - ${npc.type}`);
});

console.log('\n✨ 所有 NPC 肖像佔位符已生成完成！');
console.log('   employeeTemplates.js 現在可以正確載入這些資源。\n');
