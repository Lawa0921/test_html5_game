#!/usr/bin/env node

/**
 * 生成任務動畫佔位符（支持等軸視角雙方向）
 * 為 CharacterDispatchManager 定義的所有任務生成動畫幀
 * 每個任務都有 back（背部）和 front（正面）兩個方向
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   任務動畫佔位符生成器（雙方向）       ║');
console.log('╚═══════════════════════════════════════╝\n');

// 確保目錄存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 生成任務動畫幀（等軸視角，區分正面/背面）
function generateTaskAnimationFrame(width, height, color, characterName, taskName, frame, direction) {
    // 根據幀數調整動畫效果
    const frameOffset = (frame % 2 === 0) ? 0 : 2;
    const scaleOffset = frame % 3 === 0 ? 1.05 : 1.0;

    // 根據任務調整顏色
    let fillColor = color;
    const brightness = frame % 2 === 0 ? 10 : -10;
    fillColor = adjustBrightness(color, brightness);

    const isBack = direction === 'back';

    // 根據任務類型添加特定視覺元素
    let taskIndicator = '';

    switch(taskName) {
        case '烹飪':
            taskIndicator = isBack
                ? `<circle cx="${width/2 + 10}" cy="${height/2 - 10}" r="4" fill="#FF6347" opacity="${0.6 + frame * 0.05}"/>
                   <text x="${width/2}" y="${height - 20}" text-anchor="middle" font-size="10" fill="#FF6347">🔥</text>`
                : `<rect x="${width/2 - 8}" y="${height/2}" width="16" height="12" fill="#8B4513" stroke="#000"/>
                   <circle cx="${width/2 + 10}" cy="${height/2 - 10}" r="4" fill="#FF6347" opacity="${0.6 + frame * 0.05}"/>`;
            break;
        case '備菜':
            taskIndicator = isBack
                ? `<line x1="${width/2 - 10}" y1="${height/2 + 10}" x2="${width/2 + 10}" y2="${height/2 + 10}" stroke="#228B22" stroke-width="2"/>`
                : `<rect x="${width/2 - 10}" y="${height/2 + 5}" width="20" height="8" fill="#228B22" stroke="#000"/>
                   <line x1="${width/2 - 5}" y1="${height/2 + 8}" x2="${width/2 + 5}" y2="${height/2 + 8}" stroke="#FFF" stroke-width="1"/>`;
            break;
        case '端菜':
            taskIndicator = isBack
                ? `<ellipse cx="${width/2 - 15}" cy="${height/2 - 10}" rx="10" ry="3" fill="#FFD700" stroke="#000"/>`
                : `<ellipse cx="${width/2 - 15}" cy="${height/2 - 10}" rx="12" ry="4" fill="#FFD700" stroke="#000" stroke-width="2"/>
                   <rect x="${width/2 - 18}" y="${height/2 - 8}" width="6" height="6" fill="#FF6347"/>`;
            break;
        case '迎賓':
            taskIndicator = isBack
                ? `<path d="M ${width/2 - 12} ${height/2 + 5} L ${width/2 - 8} ${height/2}" stroke="#000" stroke-width="2" fill="none"/>`
                : `<path d="M ${width/2 - 15} ${height/2} Q ${width/2 - 10} ${height/2 - 5} ${width/2 - 5} ${height/2}" stroke="#000" stroke-width="2" fill="none"/>
                   <path d="M ${width/2 + 5} ${height/2} Q ${width/2 + 10} ${height/2 - 5} ${width/2 + 15} ${height/2}" stroke="#000" stroke-width="2" fill="none"/>`;
            break;
        case '打掃':
            taskIndicator = isBack
                ? `<line x1="${width/2 + 5}" y1="${height/2 + 15}" x2="${width/2 + 10}" y2="${height - 10}" stroke="#8B4513" stroke-width="3"/>`
                : `<line x1="${width/2 - 10}" y1="${height/2 + 10}" x2="${width/2 - 5}" y2="${height - 5}" stroke="#8B4513" stroke-width="3"/>
                   <path d="M ${width/2 - 8} ${height - 5} L ${width/2 - 15} ${height - 3} L ${width/2 - 5} ${height - 8} Z" fill="#DAA520"/>`;
            break;
        case '整理':
            taskIndicator = isBack
                ? `<rect x="${width/2 - 8}" y="${height/2 + 10}" width="16" height="12" fill="#8B4513" stroke="#000"/>`
                : `<rect x="${width/2 - 12}" y="${height/2 + 5}" width="24" height="18" fill="#D2691E" stroke="#000" stroke-width="2"/>
                   <line x1="${width/2 - 12}" y1="${height/2 + 11}" x2="${width/2 + 12}" y2="${height/2 + 11}" stroke="#000"/>
                   <line x1="${width/2 - 12}" y1="${height/2 + 17}" x2="${width/2 + 12}" y2="${height/2 + 17}" stroke="#000"/>`;
            break;
        case '演奏':
            taskIndicator = isBack
                ? `<ellipse cx="${width/2 + 15}" cy="${height/2 + 5}" rx="8" ry="12" fill="#8B4513" stroke="#000"/>`
                : `<ellipse cx="${width/2 - 15}" cy="${height/2 + 5}" rx="10" ry="15" fill="#8B4513" stroke="#000" stroke-width="2"/>
                   <line x1="${width/2 - 15}" y1="${height/2 - 5}" x2="${width/2 - 15}" y2="${height/2 + 15}" stroke="#000" stroke-width="1"/>
                   <text x="${width/2 + 10}" y="${height/2 - 5}" font-size="12" fill="#1E90FF">♪</text>`;
            break;
        case '治療':
            taskIndicator = isBack
                ? `<circle cx="${width/2 + 12}" cy="${height/2 - 8}" r="5" fill="#32CD32" opacity="0.7"/>`
                : `<circle cx="${width/2 + 12}" cy="${height/2 - 8}" r="6" fill="#32CD32" opacity="0.7"/>
                   <line x1="${width/2 + 12}" y1="${height/2 - 12}" x2="${width/2 + 12}" y2="${height/2 - 4}" stroke="#FFF" stroke-width="2"/>
                   <line x1="${width/2 + 8}" y1="${height/2 - 8}" x2="${width/2 + 16}" y2="${height/2 - 8}" stroke="#FFF" stroke-width="2"/>`;
            break;
        case '保安':
            taskIndicator = isBack
                ? `<rect x="${width/2 + 10}" y="${height/2 - 5}" width="8" height="15" fill="#696969" stroke="#000"/>`
                : `<ellipse cx="${width/2 - 15}" cy="${height/2}" rx="8" ry="12" fill="#708090" stroke="#000" stroke-width="2"/>
                   <rect x="${width/2 - 18}" y="${height/2 - 8}" width="6" height="4" fill="#FFD700"/>`;
            break;
        case '記賬':
            taskIndicator = isBack
                ? `<rect x="${width/2 - 8}" y="${height/2 + 5}" width="16" height="12" fill="#F5DEB3" stroke="#000"/>`
                : `<rect x="${width/2 - 12}" y="${height/2 + 2}" width="20" height="16" fill="#F5DEB3" stroke="#000" stroke-width="2"/>
                   <line x1="${width/2 - 8}" y1="${height/2 + 6}" x2="${width/2 + 8}" y2="${height/2 + 6}" stroke="#000"/>
                   <line x1="${width/2 - 8}" y1="${height/2 + 10}" x2="${width/2 + 8}" y2="${height/2 + 10}" stroke="#000"/>
                   <line x1="${width/2 - 8}" y1="${height/2 + 14}" x2="${width/2 + 8}" y2="${height/2 + 14}" stroke="#000"/>`;
            break;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="gradient_${taskName}_${direction}_${frame}">
      <stop offset="0%" style="stop-color:${adjustBrightness(fillColor, 30)};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- 陰影 -->
  <ellipse cx="${width / 2}" cy="${height - 5}" rx="${width/3}" ry="6" fill="#000000" opacity="0.3"/>

  <!-- 角色主體 -->
  <circle cx="${width / 2}" cy="${height / 2 + frameOffset}" r="${width * 0.35 * scaleOffset}"
          fill="url(#gradient_${taskName}_${direction}_${frame})" />

  ${taskIndicator}

  <!-- 角色標籤 -->
  <text x="${width / 2}" y="${height / 2 + frameOffset + 5}" text-anchor="middle"
        font-family="Arial" font-size="12" font-weight="bold" fill="#fff">
    ${characterName}
  </text>

  <!-- 方向標記 -->
  <text x="5" y="12" font-size="8" fill="#999">${direction === 'back' ? '背' : '面'}</text>

  <!-- 動作標籤 -->
  <text x="${width / 2}" y="${height - 5}" text-anchor="middle"
        font-family="Arial" font-size="9" fill="#333">
    ${taskName}[${frame}]
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

// 角色列表（與 generate-character-animations.js 保持一致）
// 只保留有文檔的角色 (docs/characters/)
const characters = [
    { id: '001', name: '林修然', color: '#4169E1' },
    { id: '002', name: '林語嫣', color: '#FF69B4' },
    { id: '011', name: '秦婉柔', color: '#FFC0CB' }
];

// 任務列表（來自 CharacterDispatchManager.js）
const tasks = [
    // 核心任務（高優先級）
    { id: 'cooking', name: '烹飪', frames: 6, category: 'core' },
    { id: 'prep', name: '備菜', frames: 6, category: 'core' },
    { id: 'serving', name: '端菜', frames: 6, category: 'core' },

    // 服務任務（建議）
    { id: 'greeting', name: '迎賓', frames: 3, category: 'service' },
    { id: 'cleaning', name: '打掃', frames: 6, category: 'service' },
    { id: 'tidying', name: '整理', frames: 6, category: 'service' },

    // 特殊任務（可選）
    { id: 'performing', name: '演奏', frames: 6, category: 'special' },
    { id: 'healing', name: '治療', frames: 6, category: 'special' },
    { id: 'security', name: '保安', frames: 6, category: 'special' },
    { id: 'accounting', name: '記賬', frames: 6, category: 'special' }
];

const directions = ['back', 'front'];

let totalGenerated = 0;
const baseDir = path.join(__dirname, '../assets/animations');

console.log('開始生成任務動畫（雙方向）...\n');

// 為每個角色生成任務動畫
characters.forEach((character, charIndex) => {
    console.log(`[${charIndex + 1}/${characters.length}] 生成 ${character.name} 的任務動畫...`);

    const characterDir = path.join(baseDir, character.id);
    let taskCount = 0;

    tasks.forEach(task => {
        const taskDir = path.join(characterDir, task.id);
        ensureDir(taskDir);

        directions.forEach(direction => {
            // 生成每一幀
            for (let frame = 0; frame < task.frames; frame++) {
                const fileName = `${task.id}_${direction}_${frame}.svg`;
                const filePath = path.join(taskDir, fileName);

                const svg = generateTaskAnimationFrame(
                    64, 64,
                    character.color,
                    character.name,
                    task.name,
                    frame,
                    direction
                );

                fs.writeFileSync(filePath, svg);
                totalGenerated++;
            }
        });

        taskCount++;
    });

    console.log(`  ✓ 完成 ${taskCount} 個任務 (${taskCount * 6 * 2} 幀，含雙方向)`);
});

// ==================== 總結 ====================

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   生成完成                             ║');
console.log('╚═══════════════════════════════════════╝\n');

console.log(`✅ 共生成 ${totalGenerated} 個任務動畫幀`);
console.log('');

console.log('📊 任務分類統計:');
const coreFrames = tasks.filter(t => t.category === 'core').reduce((sum, t) => sum + t.frames, 0) * characters.length * 2;
const serviceFrames = tasks.filter(t => t.category === 'service').reduce((sum, t) => sum + t.frames, 0) * characters.length * 2;
const specialFrames = tasks.filter(t => t.category === 'special').reduce((sum, t) => sum + t.frames, 0) * characters.length * 2;

console.log(`  🔴 核心任務: ${coreFrames} 幀 (cooking, prep, serving)`);
console.log(`  🟡 服務任務: ${serviceFrames} 幀 (greeting, cleaning, tidying)`);
console.log(`  🟢 特殊任務: ${specialFrames} 幀 (performing, healing, security, accounting)`);

console.log(`\n📂 生成位置: ${baseDir}`);
console.log('');

console.log('📁 文件結構示例:');
console.log('  assets/animations/001/cooking/');
console.log('    ├── cooking_back_0.svg   (NW/NE 使用，NE 需鏡像)');
console.log('    ├── cooking_back_1.svg');
console.log('    ├── ...');
console.log('    ├── cooking_front_0.svg  (SW/SE 使用，SE 需鏡像)');
console.log('    └── cooking_front_1.svg');
console.log('');

console.log('🎮 使用方式：');
console.log('  NW (西北) → 使用 *_back_*.svg，不鏡像');
console.log('  NE (東北) → 使用 *_back_*.svg，水平鏡像');
console.log('  SW (西南) → 使用 *_front_*.svg，不鏡像');
console.log('  SE (東南) → 使用 *_front_*.svg，水平鏡像');
console.log('');

console.log('✨ 所有任務動畫佔位符（雙方向）已生成完成！');
console.log('   遊戲現在可以正確載入這些動畫資源。\n');
