#!/usr/bin/env node

/**
 * 生成遊戲經營系統所需的額外素材
 * 32bit 像素風格的小圖標、按鈕等
 */

const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function generateSVG(width, height, color, text, style = 'pixel') {
    if (style === 'pixel') {
        // 像素風格
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}"/>
  <rect x="2" y="2" width="${width-4}" height="${height-4}" fill="none" stroke="#000" stroke-width="2"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        fill="#fff" font-size="${Math.min(width, height)/3}"
        font-family="Arial, sans-serif" font-weight="bold">${text}</text>
</svg>`;
    } else {
        // 普通風格
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}" rx="4"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        fill="#fff" font-size="${Math.min(width, height)/3}"
        font-family="Arial, sans-serif">${text}</text>
</svg>`;
    }
}

/**
 * 生成 32x32 小角色 sprites
 */
function generateCharacterSprites() {
    console.log('\n生成角色小圖標 (32x32)...');

    const characters = [
        { id: 0, name: '林修然', color: '#4169E1' },
        { id: 1, name: '林語嫣', color: '#FF69B4' },
        { id: 2, name: '溫如玉', color: '#98FB98' },
        { id: 3, name: '顧青鸞', color: '#DDA0DD' },
        { id: 4, name: '蘇妙音', color: '#87CEEB' },
        { id: 5, name: '翠兒', color: '#F0E68C' },
        { id: 6, name: '沈青山', color: '#A9A9A9' },
        { id: 7, name: '蕭鐵峰', color: '#CD5C5C' },
        { id: 8, name: '方無忌', color: '#F4A460' },
        { id: 9, name: '李默然', color: '#BC8F8F' },
        { id: 10, name: '秦婉柔', color: '#FFB6C1' }
    ];

    const spritesDir = path.join('assets', 'sprites');
    ensureDir(spritesDir);

    characters.forEach(char => {
        const filename = `sprite-${char.id}.svg`;
        const filepath = path.join(spritesDir, filename);
        const svg = generateSVG(32, 32, char.color, char.name[0], 'pixel');
        fs.writeFileSync(filepath, svg);
        console.log(`  ✓ ${filename} (${char.name})`);
    });
}

/**
 * 生成場景切換按鈕
 */
function generateSceneButtons() {
    console.log('\n生成場景切換按鈕...');

    const buttons = [
        { id: 'lobby', label: '大廳', color: '#DAA520' },
        { id: 'kitchen', label: '廚房', color: '#FF6347' },
        { id: 'storage', label: '儲藏室', color: '#8B4513' },
        { id: 'room-a', label: '客房A', color: '#6495ED' },
        { id: 'room-b', label: '客房B', color: '#6495ED' },
        { id: 'exterior', label: '門口', color: '#228B22' }
    ];

    const buttonsDir = path.join('assets', 'ui', 'buttons');
    ensureDir(buttonsDir);

    buttons.forEach(btn => {
        // 普通狀態
        const normalFile = `btn-${btn.id}-normal.svg`;
        const normalPath = path.join(buttonsDir, normalFile);
        const normalSvg = generateSVG(120, 40, btn.color, btn.label);
        fs.writeFileSync(normalPath, normalSvg);
        console.log(`  ✓ ${normalFile}`);

        // 懸停狀態
        const hoverFile = `btn-${btn.id}-hover.svg`;
        const hoverPath = path.join(buttonsDir, hoverFile);
        const lighterColor = adjustBrightness(btn.color, 20);
        const hoverSvg = generateSVG(120, 40, lighterColor, btn.label);
        fs.writeFileSync(hoverPath, hoverSvg);
        console.log(`  ✓ ${hoverFile}`);
    });
}

/**
 * 生成通知UI元素
 */
function generateNotificationUI() {
    console.log('\n生成通知UI元素...');

    const notifDir = path.join('assets', 'ui', 'notifications');
    ensureDir(notifDir);

    // 通知背景
    const bgSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="280" height="80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="notifGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFF8DC;stop-opacity:0.95" />
      <stop offset="100%" style="stop-color:#F5DEB3;stop-opacity:0.95" />
    </linearGradient>
  </defs>
  <rect width="280" height="80" fill="url(#notifGrad)" rx="8"/>
  <rect x="2" y="2" width="276" height="76" fill="none" stroke="#DAA520" stroke-width="2" rx="6"/>
</svg>`;
    fs.writeFileSync(path.join(notifDir, 'notification-bg.svg'), bgSvg);
    console.log('  ✓ notification-bg.svg');

    // 圖標
    const icons = [
        { name: 'info', color: '#4169E1', text: 'ℹ️' },
        { name: 'success', color: '#32CD32', text: '✓' },
        { name: 'warning', color: '#FFA500', text: '⚠' },
        { name: 'error', color: '#DC143C', text: '✗' },
        { name: 'event', color: '#9370DB', text: '!' }
    ];

    icons.forEach(icon => {
        const svg = generateSVG(24, 24, icon.color, icon.text);
        const filepath = path.join(notifDir, `icon-${icon.name}.svg`);
        fs.writeFileSync(filepath, svg);
        console.log(`  ✓ icon-${icon.name}.svg`);
    });
}

/**
 * 生成工作站圖標
 */
function generateWorkstationIcons() {
    console.log('\n生成工作站圖標...');

    const stations = [
        { id: 'management', label: '管理', color: '#FFD700' },
        { id: 'lobby', label: '大廳', color: '#DAA520' },
        { id: 'kitchen', label: '廚房', color: '#FF6347' },
        { id: 'security', label: '安保', color: '#CD5C5C' },
        { id: 'entertainment', label: '娛樂', color: '#9370DB' },
        { id: 'medicine', label: '藥房', color: '#32CD32' }
    ];

    const iconsDir = path.join('assets', 'ui', 'icons');
    ensureDir(iconsDir);

    stations.forEach(station => {
        const svg = generateSVG(48, 48, station.color, station.label.substring(0, 2), 'pixel');
        const filepath = path.join(iconsDir, `station-${station.id}.svg`);
        fs.writeFileSync(filepath, svg);
        console.log(`  ✓ station-${station.id}.svg (${station.label})`);
    });
}

/**
 * 生成狀態圖標
 */
function generateStatusIcons() {
    console.log('\n生成狀態圖標...');

    const icons = [
        { name: 'fatigue', label: '疲勞', color: '#8B4513', text: '累' },
        { name: 'health', label: '健康', color: '#DC143C', text: '❤' },
        { name: 'mood', label: '心情', color: '#FFD700', text: '☺' },
        { name: 'silver', label: '銀兩', color: '#C0C0C0', text: '銀' },
        { name: 'reputation', label: '名聲', color: '#FFD700', text: '名' },
        { name: 'time', label: '時間', color: '#87CEEB', text: '時' }
    ];

    const iconsDir = path.join('assets', 'ui', 'icons');
    ensureDir(iconsDir);

    icons.forEach(icon => {
        const svg = generateSVG(24, 24, icon.color, icon.text);
        const filepath = path.join(iconsDir, `icon-${icon.name}.svg`);
        fs.writeFileSync(filepath, svg);
        console.log(`  ✓ icon-${icon.name}.svg (${icon.label})`);
    });
}

/**
 * 生成場景背景佔位圖
 */
function generateSceneBackgrounds() {
    console.log('\n生成場景背景佔位圖（900x650）...');

    const scenes = [
        { name: 'lobby', label: '客棧大廳', color: '#D2B48C' },
        { name: 'kitchen', label: '廚房', color: '#CD853F' },
        { name: 'storage', label: '儲藏室', color: '#8B7355' },
        { name: 'room-a', label: '客房A', color: '#DEB887' },
        { name: 'room-b', label: '客房B', color: '#DEB887' },
        { name: 'exterior', label: '客棧外觀', color: '#8B4513' }
    ];

    const scenesDir = path.join('assets', 'scenes');
    ensureDir(scenesDir);

    scenes.forEach(scene => {
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="900" height="650" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sceneBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${scene.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(scene.color, -20)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="900" height="650" fill="url(#sceneBg)"/>
  <rect x="10" y="10" width="880" height="630" fill="none" stroke="#000" stroke-width="4"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        fill="#fff" font-size="48" font-family="Arial, sans-serif"
        font-weight="bold" stroke="#000" stroke-width="2">${scene.label}</text>
  <text x="50%" y="60%" text-anchor="middle"
        fill="#ddd" font-size="20" font-family="monospace">（臨時佔位圖）</text>
</svg>`;
        const filepath = path.join(scenesDir, `${scene.name}.svg`);
        fs.writeFileSync(filepath, svg);
        console.log(`  ✓ ${scene.name}.svg`);
    });
}

/**
 * 調整顏色亮度
 */
function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

/**
 * 主函數
 */
function main() {
    console.log('=================================');
    console.log('   遊戲經營素材生成器');
    console.log('   (32bit 像素風格)');
    console.log('=================================');

    try {
        generateCharacterSprites();
        generateSceneButtons();
        generateNotificationUI();
        generateWorkstationIcons();
        generateStatusIcons();
        generateSceneBackgrounds();

        console.log('\n=================================');
        console.log('✅ 所有經營素材生成完成！');
        console.log('=================================\n');

        console.log('📁 生成的資源：');
        console.log('  assets/sprites/          - 角色小圖標 (32x32)');
        console.log('  assets/ui/buttons/       - 場景切換按鈕');
        console.log('  assets/ui/notifications/ - 通知UI元素');
        console.log('  assets/ui/icons/         - 工作站和狀態圖標');
        console.log('  assets/scenes/           - 場景背景 (900x650)');
        console.log('');

    } catch (error) {
        console.error('❌ 錯誤：', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 執行
if (require.main === module) {
    main();
}

module.exports = {
    generateCharacterSprites,
    generateSceneButtons,
    generateNotificationUI,
    generateWorkstationIcons,
    generateStatusIcons,
    generateSceneBackgrounds
};
