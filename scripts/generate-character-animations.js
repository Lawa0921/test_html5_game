#!/usr/bin/env node

/**
 * 生成角色動畫幀佔位圖（支持等軸視角雙方向）
 * 每個角色的每個動作都有 back（背部）和 front（正面）兩個方向
 * NE/NW 使用 back 動畫（NE 鏡像）
 * SE/SW 使用 front 動畫（SE 鏡像）
 */

const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * 生成單幀 SVG（等軸視角，區分正面/背面）
 */
function generateIsometricFrame(width, height, color, characterName, action, frame, direction) {
    // 根據幀數調整動畫效果
    const frameOffset = (frame % 2 === 0) ? 0 : 2;  // 偶數幀上移2px
    const scaleOffset = frame % 3 === 0 ? 1.05 : 1.0;  // 每3幀放大一點

    // 根據動作調整顏色
    let fillColor = color;
    if (action === 'sleep') {
        fillColor = adjustBrightness(color, -30);  // 睡覺時變暗
    } else if (action === 'work') {
        fillColor = adjustBrightness(color, frame % 2 === 0 ? 10 : -10);  // 工作時閃爍
    }

    // 等軸視角身體參數
    const bodyWidth = Math.floor(width * 0.5 * scaleOffset);
    const bodyHeight = Math.floor(height * 0.6);
    const headSize = Math.floor(width * 0.35);

    // 背部還是正面
    const isBack = direction === 'back';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- 陰影（等軸橢圓）-->
  <ellipse cx="${width/2}" cy="${height - 5}" rx="${width/3}" ry="6" fill="#000000" opacity="0.3"/>

  <!-- 身體（等軸視角的梯形）-->
  <path d="M ${width/2 - bodyWidth/2} ${height/2 + 5 - frameOffset}
           L ${width/2 + bodyWidth/2} ${height/2 + 5 - frameOffset}
           L ${width/2 + bodyWidth/3} ${height - 15 - frameOffset}
           L ${width/2 - bodyWidth/3} ${height - 15 - frameOffset} Z"
        fill="${fillColor}" stroke="#000" stroke-width="2"/>

  <!-- 頭部 -->
  <circle cx="${width/2}" cy="${height/3 - frameOffset}" r="${headSize}"
          fill="${adjustBrightness(fillColor, 20)}" stroke="#000" stroke-width="2"/>

  <!-- 表情（根據方向和動作變化）-->
  ${getIsometricExpression(width/2, height/3 - frameOffset, action, frame, isBack)}

  <!-- 方向標記 -->
  <text x="5" y="12" font-size="8" fill="#999">${direction === 'back' ? '背' : '面'}</text>

  <!-- 動作標記 -->
  <text x="${width/2}" y="${height - 5}" text-anchor="middle"
        font-size="8" fill="#666">${action}_${frame}</text>
</svg>`;
}

/**
 * 根據方向、動作和幀數生成表情 SVG
 */
function getIsometricExpression(centerX, centerY, action, frame, isBack) {
    const eyeOffsetX = 6;
    const eyeOffsetY = -2;

    let eyes = '';
    let mouth = '';
    let extra = ''; // 額外元素（如頭髮、帽子等）

    if (isBack) {
        // 背面 - 看不到臉，顯示頭髮/後腦勺
        extra = `
            <!-- 後腦勺頭髮 -->
            <path d="M ${centerX - 12} ${centerY - 8}
                     Q ${centerX - 15} ${centerY} ${centerX - 12} ${centerY + 8}"
                  stroke="#000" stroke-width="2" fill="none"/>
            <path d="M ${centerX + 12} ${centerY - 8}
                     Q ${centerX + 15} ${centerY} ${centerX + 12} ${centerY + 8}"
                  stroke="#000" stroke-width="2" fill="none"/>
            <circle cx="${centerX}" cy="${centerY - 10}" r="3" fill="#000"/>
        `;

        // 背部動作特效
        if (action === 'walk') {
            // 行走時顯示移動線
            extra += `<line x1="${centerX - 20}" y1="${centerY}"
                           x2="${centerX - 15}" y2="${centerY}"
                           stroke="#999" stroke-width="1" opacity="0.5"/>`;
        }
    } else {
        // 正面 - 完整的臉部
        switch(action) {
            case 'idle':
                // 眨眼動畫
                if (frame === 3) {
                    eyes = `<line x1="${centerX - eyeOffsetX - 2}" y1="${centerY + eyeOffsetY}"
                                 x2="${centerX - eyeOffsetX + 2}" y2="${centerY + eyeOffsetY}"
                                 stroke="#000" stroke-width="2"/>
                           <line x1="${centerX + eyeOffsetX - 2}" y1="${centerY + eyeOffsetY}"
                                 x2="${centerX + eyeOffsetX + 2}" y2="${centerY + eyeOffsetY}"
                                 stroke="#000" stroke-width="2"/>`;
                } else {
                    eyes = `<circle cx="${centerX - eyeOffsetX}" cy="${centerY + eyeOffsetY}" r="2" fill="#000"/>
                           <circle cx="${centerX + eyeOffsetX}" cy="${centerY + eyeOffsetY}" r="2" fill="#000"/>`;
                }
                mouth = `<path d="M ${centerX - 5} ${centerY + 8} Q ${centerX} ${centerY + 10} ${centerX + 5} ${centerY + 8}"
                              stroke="#000" fill="none" stroke-width="1.5"/>`;
                break;

            case 'walk':
                // 行走時眼睛正常
                eyes = `<circle cx="${centerX - eyeOffsetX}" cy="${centerY + eyeOffsetY}" r="2" fill="#000"/>
                       <circle cx="${centerX + eyeOffsetX}" cy="${centerY + eyeOffsetY}" r="2" fill="#000"/>`;
                mouth = `<line x1="${centerX - 4}" y1="${centerY + 8}" x2="${centerX + 4}" y2="${centerY + 8}"
                              stroke="#000" stroke-width="1.5"/>`;
                break;

            case 'work':
                // 工作時專注的表情
                eyes = `<circle cx="${centerX - eyeOffsetX}" cy="${centerY + eyeOffsetY}" r="2" fill="#000"/>
                       <circle cx="${centerX + eyeOffsetX}" cy="${centerY + eyeOffsetY}" r="2" fill="#000"/>`;
                mouth = `<circle cx="${centerX}" cy="${centerY + 8}" r="3" fill="#000"/>`;
                break;

            case 'rest':
                // 休息時放鬆的表情
                eyes = `<path d="M ${centerX - eyeOffsetX - 3} ${centerY + eyeOffsetY}
                                Q ${centerX - eyeOffsetX} ${centerY + eyeOffsetY - 2} ${centerX - eyeOffsetX + 3} ${centerY + eyeOffsetY}"
                              stroke="#000" fill="none" stroke-width="1.5"/>
                       <path d="M ${centerX + eyeOffsetX - 3} ${centerY + eyeOffsetY}
                                Q ${centerX + eyeOffsetX} ${centerY + eyeOffsetY - 2} ${centerX + eyeOffsetX + 3} ${centerY + eyeOffsetY}"
                              stroke="#000" fill="none" stroke-width="1.5"/>`;
                mouth = `<path d="M ${centerX - 5} ${centerY + 8} Q ${centerX} ${centerY + 12} ${centerX + 5} ${centerY + 8}"
                              stroke="#000" fill="none" stroke-width="1.5"/>`;
                break;

            case 'sleep':
                // 睡覺時閉眼
                eyes = `<line x1="${centerX - eyeOffsetX - 3}" y1="${centerY + eyeOffsetY}"
                             x2="${centerX - eyeOffsetX + 3}" y2="${centerY + eyeOffsetY}"
                             stroke="#000" stroke-width="2"/>
                       <line x1="${centerX + eyeOffsetX - 3}" y1="${centerY + eyeOffsetY}"
                             x2="${centerX + eyeOffsetX + 3}" y2="${centerY + eyeOffsetY}"
                             stroke="#000" stroke-width="2"/>`;
                mouth = `<path d="M ${centerX - 4} ${centerY + 10} Q ${centerX} ${centerY + 8} ${centerX + 4} ${centerY + 10}"
                              stroke="#000" fill="none" stroke-width="1.5"/>`;
                // 添加 ZZZ
                if (frame % 2 === 0) {
                    extra = `<text x="${centerX + 15}" y="${centerY - 10}" font-size="12" fill="#666">Z</text>`;
                }
                break;
        }
    }

    return eyes + mouth + extra;
}

/**
 * 調整顏色亮度
 */
function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));

    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * 生成所有角色的所有動畫幀（雙方向）
 */
function generateAllCharacterAnimations() {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   等軸視角角色動畫生成器（雙方向）     ║');
    console.log('╚═══════════════════════════════════════╝\n');

    // 只保留有文檔的角色 (docs/characters/)
    const characters = [
        { id: '001', name: '林修然', color: '#4169E1' },
        { id: '002', name: '林語嫣', color: '#FF69B4' },
        { id: '011', name: '秦婉柔', color: '#FFB6C1' }
    ];

    const actions = [
        { name: 'idle', label: '待機', frames: 6 },
        { name: 'walk', label: '行走', frames: 6 },
        { name: 'work', label: '工作', frames: 6 },
        { name: 'rest', label: '休息', frames: 6 },
        { name: 'sleep', label: '睡覺', frames: 6 }
    ];

    const directions = ['back', 'front'];

    const frameSize = { width: 64, height: 64 };

    let totalFrames = 0;

    characters.forEach((char, charIndex) => {
        console.log(`[${charIndex + 1}/${characters.length}] 生成 ${char.name} (${char.id})...`);

        const charDir = path.join('assets', 'animations', char.id);
        ensureDir(charDir);

        let charFrameCount = 0;

        // 為每個動作生成兩個方向
        actions.forEach(action => {
            const actionDir = path.join(charDir, action.name);
            ensureDir(actionDir);

            directions.forEach(direction => {
                for (let frame = 0; frame < action.frames; frame++) {
                    const filename = `${action.name}_${direction}_${frame}.svg`;
                    const filepath = path.join(actionDir, filename);
                    const svg = generateIsometricFrame(
                        frameSize.width,
                        frameSize.height,
                        char.color,
                        char.name,
                        action.name,
                        frame,
                        direction
                    );
                    fs.writeFileSync(filepath, svg);
                    charFrameCount++;
                    totalFrames++;
                }
            });

            console.log(`  ✓ ${action.label}: ${action.frames * 2} 幀 (back + front)`);
        });

        console.log(`  → 小計: ${charFrameCount} 幀`);
    });

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   生成完成                             ║');
    console.log('╚═══════════════════════════════════════╝\n');

    console.log('📊 統計：');
    console.log(`  角色數量: ${characters.length}`);
    console.log(`  動作類型: ${actions.length}`);
    console.log(`  方向數量: 2 (back/front)`);
    console.log(`  總計幀數: ${totalFrames}`);
    console.log('');

    console.log('📁 文件結構：');
    console.log('  assets/animations/001/');
    console.log('    ├── idle/');
    console.log('    │   ├── idle_back_0.svg   (NW/NE 使用，NE 需鏡像)');
    console.log('    │   ├── idle_back_1.svg');
    console.log('    │   ├── ...');
    console.log('    │   ├── idle_front_0.svg  (SW/SE 使用，SE 需鏡像)');
    console.log('    │   └── idle_front_1.svg');
    console.log('    ├── walk/');
    console.log('    ├── work/');
    console.log('    ├── rest/');
    console.log('    └── sleep/');
    console.log('');

    console.log('🎮 使用方式：');
    console.log('  NW (西北) → 使用 *_back_*.svg，不鏡像');
    console.log('  NE (東北) → 使用 *_back_*.svg，水平鏡像');
    console.log('  SW (西南) → 使用 *_front_*.svg，不鏡像');
    console.log('  SE (東南) → 使用 *_front_*.svg，水平鏡像');
    console.log('');
}

// 執行
if (require.main === module) {
    generateAllCharacterAnimations();
}

module.exports = { generateAllCharacterAnimations };
