#!/usr/bin/env node

/**
 * 生成物品圖標和特效佔位圖
 */

const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * 生成物品圖標 SVG
 */
function generateItemIcon(size, color, itemName, emoji) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="${size}" height="${size}" fill="${color}" rx="8"/>
  <rect x="2" y="2" width="${size-4}" height="${size-4}"
        fill="none" stroke="#000" stroke-width="2" rx="6"/>

  <!-- 圖標/表情符號 -->
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-size="${size * 0.5}" fill="#fff">${emoji}</text>

  <!-- 物品名稱 -->
  <text x="50%" y="${size - 8}" text-anchor="middle"
        font-size="10" fill="#333" font-family="Arial">${itemName}</text>
</svg>`;
}

/**
 * 生成特效幀 SVG
 */
function generateEffectFrame(width, height, effectType, frame) {
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

    const centerX = width / 2;
    const centerY = height / 2;

    switch(effectType) {
        case 'hit':
            // 打擊特效（星形爆炸）
            const starSize = 20 + (frame * 8);
            const opacity = 1 - (frame * 0.15);
            svg += `
  <circle cx="${centerX}" cy="${centerY}" r="${starSize}"
          fill="#FFD700" opacity="${opacity}"/>
  <circle cx="${centerX}" cy="${centerY}" r="${starSize * 0.6}"
          fill="#FF4500" opacity="${opacity}"/>`;
            break;

        case 'heal':
            // 治療特效（綠色光芒）
            const healSize = 15 + (frame * 5);
            const healOpacity = 1 - (frame * 0.12);
            svg += `
  <circle cx="${centerX}" cy="${centerY - frame * 5}" r="${healSize}"
          fill="#32CD32" opacity="${healOpacity}"/>
  <circle cx="${centerX}" cy="${centerY - frame * 5}" r="${healSize * 0.5}"
          fill="#90EE90" opacity="${healOpacity}"/>
  <text x="${centerX}" y="${centerY - frame * 5}" text-anchor="middle"
        font-size="20" fill="#fff">+</text>`;
            break;

        case 'level_up':
            // 升級特效（金色光環）
            const ringSize = 10 + (frame * 10);
            const ringOpacity = 1 - (frame * 0.15);
            svg += `
  <circle cx="${centerX}" cy="${centerY}" r="${ringSize}"
          fill="none" stroke="#FFD700" stroke-width="3" opacity="${ringOpacity}"/>
  <circle cx="${centerX}" cy="${centerY}" r="${ringSize * 0.7}"
          fill="none" stroke="#FFA500" stroke-width="2" opacity="${ringOpacity}"/>
  <text x="${centerX}" y="${centerY + 5}" text-anchor="middle"
        font-size="24" fill="#FFD700" font-weight="bold">UP!</text>`;
            break;

        case 'coin':
            // 金錢特效（飛出的金幣）
            const coinY = centerY - (frame * 8);
            const coinOpacity = 1 - (frame * 0.15);
            svg += `
  <circle cx="${centerX}" cy="${coinY}" r="12"
          fill="#FFD700" stroke="#FFA500" stroke-width="2" opacity="${coinOpacity}"/>
  <text x="${centerX}" y="${coinY + 5}" text-anchor="middle"
        font-size="16" fill="#FFA500">$</text>`;
            break;

        case 'sparkle':
            // 閃光特效
            const sparkleOpacity = frame < 3 ? frame * 0.3 : (6 - frame) * 0.3;
            const sparkleSize = frame < 3 ? frame * 5 : (6 - frame) * 5;
            svg += `
  <path d="M${centerX} ${centerY - sparkleSize}
           L${centerX + sparkleSize * 0.3} ${centerY - sparkleSize * 0.3}
           L${centerX + sparkleSize} ${centerY}
           L${centerX + sparkleSize * 0.3} ${centerY + sparkleSize * 0.3}
           L${centerX} ${centerY + sparkleSize}
           L${centerX - sparkleSize * 0.3} ${centerY + sparkleSize * 0.3}
           L${centerX - sparkleSize} ${centerY}
           L${centerX - sparkleSize * 0.3} ${centerY - sparkleSize * 0.3}
           Z"
        fill="#FFD700" opacity="${sparkleOpacity}"/>`;
            break;

        case 'smoke':
            // 煙霧特效
            const smokeY = centerY - (frame * 6);
            const smokeSize = 15 + (frame * 3);
            const smokeOpacity = 0.7 - (frame * 0.1);
            svg += `
  <circle cx="${centerX - 5}" cy="${smokeY}" r="${smokeSize}"
          fill="#888888" opacity="${smokeOpacity}"/>
  <circle cx="${centerX + 5}" cy="${smokeY + 5}" r="${smokeSize * 0.8}"
          fill="#999999" opacity="${smokeOpacity * 0.8}"/>`;
            break;
    }

    svg += '\n</svg>';
    return svg;
}

/**
 * 生成所有物品圖標
 */
function generateItemIcons() {
    console.log('\n生成物品圖標...');

    const iconSize = 128;

    const items = {
        food: [
            { name: '米飯', emoji: '🍚', color: '#F5DEB3' },
            { name: '麵條', emoji: '🍜', color: '#FFE4B5' },
            { name: '包子', emoji: '🥟', color: '#FFDAB9' },
            { name: '魚', emoji: '🐟', color: '#87CEEB' },
            { name: '肉', emoji: '🍖', color: '#CD5C5C' },
            { name: '蔬菜', emoji: '🥬', color: '#90EE90' },
            { name: '茶', emoji: '🍵', color: '#98FB98' },
            { name: '酒', emoji: '🍶', color: '#FFD700' },
            { name: '點心', emoji: '🍡', color: '#FFB6C1' },
            { name: '水果', emoji: '🍎', color: '#FF6347' }
        ],
        equipment: [
            { name: '劍', emoji: '⚔️', color: '#C0C0C0' },
            { name: '盔甲', emoji: '🛡️', color: '#8B7355' },
            { name: '弓', emoji: '🏹', color: '#8B4513' },
            { name: '衣服', emoji: '👘', color: '#DDA0DD' },
            { name: '鞋子', emoji: '👞', color: '#A0522D' },
            { name: '戒指', emoji: '💍', color: '#FFD700' },
            { name: '項鍊', emoji: '📿', color: '#4169E1' },
            { name: '玉佩', emoji: '🔮', color: '#98FB98' }
        ],
        materials: [
            { name: '木材', emoji: '🪵', color: '#8B4513' },
            { name: '石頭', emoji: '🪨', color: '#808080' },
            { name: '布料', emoji: '🧵', color: '#F0E68C' },
            { name: '金屬', emoji: '⚙️', color: '#C0C0C0' },
            { name: '藥草', emoji: '🌿', color: '#32CD32' },
            { name: '銀兩', emoji: '💰', color: '#FFD700' },
            { name: '紙張', emoji: '📜', color: '#FFFACD' },
            { name: '墨水', emoji: '🖊️', color: '#000000' }
        ]
    };

    let totalItems = 0;

    Object.entries(items).forEach(([category, itemList]) => {
        const categoryDir = path.join('assets', 'items', category);
        ensureDir(categoryDir);

        itemList.forEach(item => {
            const filename = `${item.name}.svg`;
            const filepath = path.join(categoryDir, filename);
            const svg = generateItemIcon(iconSize, item.color, item.name, item.emoji);
            fs.writeFileSync(filepath, svg);
            totalItems++;
        });

        console.log(`  ✓ ${category}: ${itemList.length} 項`);
    });

    return totalItems;
}

/**
 * 生成所有特效動畫
 */
function generateEffects() {
    console.log('\n生成特效動畫...');

    const effectTypes = [
        { name: 'hit', label: '打擊', folder: 'combat' },
        { name: 'heal', label: '治療', folder: 'status' },
        { name: 'level_up', label: '升級', folder: 'status' },
        { name: 'coin', label: '金錢', folder: 'items' },
        { name: 'sparkle', label: '閃光', folder: 'particles' },
        { name: 'smoke', label: '煙霧', folder: 'particles' }
    ];

    const framesPerEffect = 6;
    const effectSize = { width: 128, height: 128 };
    let totalEffects = 0;

    effectTypes.forEach(effect => {
        const effectDir = path.join('assets', 'effects', effect.folder, effect.name);
        ensureDir(effectDir);

        for (let frame = 0; frame < framesPerEffect; frame++) {
            const filename = `${effect.name}_${frame}.svg`;
            const filepath = path.join(effectDir, filename);
            const svg = generateEffectFrame(
                effectSize.width,
                effectSize.height,
                effect.name,
                frame
            );
            fs.writeFileSync(filepath, svg);
            totalEffects++;
        }

        console.log(`  ✓ ${effect.label}: ${framesPerEffect} 幀`);
    });

    return totalEffects;
}

/**
 * 主函數
 */
function main() {
    console.log('=================================');
    console.log('   物品與特效生成器');
    console.log('=================================');

    const itemCount = generateItemIcons();
    const effectCount = generateEffects();

    console.log('\n=================================');
    console.log('✅ 生成完成！');
    console.log('=================================\n');

    console.log('📊 統計：');
    console.log(`  物品圖標：${itemCount} 個`);
    console.log(`  特效幀：${effectCount} 幀`);
    console.log(`  總計：${itemCount + effectCount} 個文件`);
    console.log('');

    console.log('📁 生成的資源：');
    console.log('  assets/items/food/       - 食物圖標 (128x128)');
    console.log('  assets/items/equipment/  - 裝備圖標 (128x128)');
    console.log('  assets/items/materials/  - 材料圖標 (128x128)');
    console.log('  assets/effects/combat/   - 戰鬥特效');
    console.log('  assets/effects/status/   - 狀態特效');
    console.log('  assets/effects/items/    - 物品特效');
    console.log('  assets/effects/particles/ - 粒子特效');
    console.log('');
}

// 執行
if (require.main === module) {
    main();
}

module.exports = { generateItemIcons, generateEffects };
