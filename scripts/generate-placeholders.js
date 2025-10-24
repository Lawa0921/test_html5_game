#!/usr/bin/env node

/**
 * 佔位圖片生成器
 * 為遊戲生成所有必要的佔位圖片
 */

const fs = require('fs');
const path = require('path');

// 顏色方案
const COLORS = {
  male: '#4A90E2',      // 藍色系 - 男性角色
  female: '#E91E63',    // 粉色系 - 女性角色
  neutral: '#4CAF50',   // 綠色系 - 中性角色
  background: '#B0BEC5', // 灰色系 - 背景
  ui: '#9C27B0'         // 紫色系 - UI元素
};

// 角色列表
const CHARACTERS = [
  { id: '001', name: '林修然', gender: 'male', emotions: ['normal', 'smile', 'serious', 'sad', 'angry'] },
  { id: '002', name: '林語嫣', gender: 'female', emotions: ['normal', 'scared', 'cooking', 'crying', 'smile'] },
  { id: '003', name: '溫如玉', gender: 'female', emotions: ['normal', 'smile', 'sad', 'shy', 'determined'] },
  { id: '004', name: '顧青鸞', gender: 'female', emotions: ['normal', 'cold', 'smile', 'serious', 'angry'] },
  { id: '005', name: '蘇妙音', gender: 'female', emotions: ['normal', 'playing', 'smile', 'sad', 'killer'] },
  { id: '006', name: '翠兒', gender: 'female', emotions: ['normal', 'happy', 'pout', 'excited', 'shy'] },
  { id: '007', name: '沈青山', gender: 'male', emotions: ['normal', 'smile', 'serious'] },
  { id: '008', name: '蕭鐵峰', gender: 'male', emotions: ['normal', 'serious', 'angry', 'fighting'] },
  { id: '009', name: '方無忌', gender: 'male', emotions: ['normal', 'smile', 'storytelling'] },
  { id: '010', name: '李默然', gender: 'male', emotions: ['normal', 'calculating', 'smile'] },
  { id: '011', name: '秦婉柔', gender: 'female', emotions: ['normal', 'playing', 'crying', 'smile', 'afraid', 'determined'] }
];

// 場景列表
const BACKGROUNDS = [
  { category: 'inn', name: 'exterior_day', desc: '客棧外觀（白天）' },
  { category: 'inn', name: 'exterior_night', desc: '客棧外觀（夜晚）' },
  { category: 'inn', name: 'lobby', desc: '客棧大廳' },
  { category: 'inn', name: 'kitchen', desc: '廚房' },
  { category: 'inn', name: 'room_mc', desc: '主角房間' },
  { category: 'inn', name: 'room_yuyan', desc: '林語嫣房間' },
  { category: 'inn', name: 'courtyard', desc: '庭院' },
  { category: 'town', name: 'street_day', desc: '街道（白天）' },
  { category: 'town', name: 'street_night', desc: '街道（夜晚）' },
  { category: 'town', name: 'market', desc: '集市' },
  { category: 'special', name: 'fire_ruins', desc: '火災廢墟' },
  { category: 'special', name: 'qin_mansion', desc: '秦府' }
];

// UI元素列表
const UI_ELEMENTS = [
  { name: 'dialogue_box', desc: '對話框', size: { width: 1600, height: 300 } },
  { name: 'button_normal', desc: '按鈕（普通）', size: { width: 200, height: 60 } },
  { name: 'button_hover', desc: '按鈕（懸停）', size: { width: 200, height: 60 } },
  { name: 'name_plate', desc: '名字牌', size: { width: 300, height: 80 } }
];

/**
 * 生成 SVG 佔位圖片
 */
function generateSVG(width, height, color, text) {
  const lines = text.split('\n');
  const lineHeight = 40;
  const startY = (height - (lines.length * lineHeight)) / 2 + lineHeight;

  const textElements = lines.map((line, index) =>
    `<text x="50%" y="${startY + (index * lineHeight)}" text-anchor="middle" fill="white" font-size="32" font-family="Arial, sans-serif">${escapeXml(line)}</text>`
  ).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}"/>
  ${textElements}
</svg>`;
}

/**
 * 轉義 XML 特殊字符
 */
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

/**
 * 生成角色立繪佔位圖
 */
function generateCharacterPortraits() {
  console.log('生成角色立繪佔位圖...');

  CHARACTERS.forEach(character => {
    const color = character.gender === 'male' ? COLORS.male : COLORS.female;

    character.emotions.forEach(emotion => {
      const filename = `${character.id}_${character.name}_portrait_${emotion}.svg`;
      const filepath = path.join('assets', 'characters', 'portraits', filename);
      const text = `${character.name}\n立繪\n${emotion}`;
      const svg = generateSVG(800, 1200, color, text);

      fs.writeFileSync(filepath, svg);
      console.log(`  ✓ ${filename}`);
    });

    // 頭像
    const avatarFilename = `${character.id}_${character.name}_avatar.svg`;
    const avatarFilepath = path.join('assets', 'characters', 'avatars', avatarFilename);
    const avatarSvg = generateSVG(64, 64, color, character.name.substring(0, 2));
    fs.writeFileSync(avatarFilepath, avatarSvg);
    console.log(`  ✓ ${avatarFilename}`);
  });
}

/**
 * 生成背景佔位圖
 */
function generateBackgrounds() {
  console.log('\n生成背景佔位圖...');

  BACKGROUNDS.forEach(bg => {
    const filename = `bg_${bg.name}.svg`;
    const filepath = path.join('assets', 'backgrounds', bg.category, filename);
    const text = `背景場景\n${bg.desc}`;
    const svg = generateSVG(1920, 1080, COLORS.background, text);

    fs.writeFileSync(filepath, svg);
    console.log(`  ✓ ${filename}`);
  });
}

/**
 * 生成UI元素佔位圖
 */
function generateUIElements() {
  console.log('\n生成UI元素佔位圖...');

  UI_ELEMENTS.forEach(element => {
    const filename = `ui_${element.name}.svg`;
    const filepath = path.join('assets', 'ui', 'windows', filename);
    const text = element.desc;
    const svg = generateSVG(element.size.width, element.size.height, COLORS.ui, text);

    fs.writeFileSync(filepath, svg);
    console.log(`  ✓ ${filename}`);
  });
}

/**
 * 生成 README 說明文件
 */
function generateReadme() {
  console.log('\n生成 README 文件...');

  const readme = `# 遊戲圖片資源

此目錄包含遊戲所需的所有圖片資源。

## 📁 目錄結構

\`\`\`
assets/
├── characters/          # 角色相關圖片
│   ├── portraits/      # 立繪（800x1200）
│   ├── avatars/        # 頭像（64x64）
│   ├── emotions/       # 表情差分
│   └── cg/             # CG圖
├── backgrounds/         # 背景圖片（1920x1080）
│   ├── inn/            # 客棧場景
│   ├── town/           # 城鎮場景
│   └── special/        # 特殊場景
├── ui/                  # UI元素
│   ├── buttons/        # 按鈕
│   ├── windows/        # 對話框、窗口
│   └── icons/          # 圖標
├── items/              # 物品圖標（128x128）
│   ├── food/           # 食物
│   ├── equipment/      # 裝備
│   └── materials/      # 材料
└── effects/            # 特效
    ├── particles/      # 粒子效果
    └── animations/     # 動畫序列
\`\`\`

## 🎨 當前狀態

**目前為佔位圖片（SVG格式）**

所有圖片都是自動生成的 SVG 佔位圖，用於開發測試。
正式美術資源應替換這些佔位圖。

## 📝 佔位圖說明

- **角色立繪**：800x1200px，使用角色專屬顏色
  - 男性：藍色 (#4A90E2)
  - 女性：粉色 (#E91E63)
- **背景**：1920x1080px，灰色系
- **UI元素**：各種尺寸，紫色系

## 🔄 替換流程

1. 將正式美術資源放入對應目錄
2. 保持相同的文件名（或更新 Phaser 載入代碼）
3. 建議使用 PNG 格式（需透明背景時）
4. 建議使用 JPG 格式（背景圖等不需透明時）

## 📊 統計

- 角色數量：11人
- 角色立繪：${CHARACTERS.reduce((sum, c) => sum + c.emotions.length, 0)}張
- 角色頭像：${CHARACTERS.length}張
- 背景圖：${BACKGROUNDS.length}張
- UI元素：${UI_ELEMENTS.length}個

## 🔗 相關文檔

詳細的圖片需求清單請參考：
\`docs/ASSETS_CHECKLIST.md\`

---

**生成日期**：${new Date().toISOString().split('T')[0]}
**生成工具**：scripts/generate-placeholders.js
`;

  fs.writeFileSync(path.join('assets', 'README.md'), readme);
  console.log('  ✓ assets/README.md');
}

/**
 * 生成圖片清單 JSON
 */
function generateManifest() {
  console.log('\n生成圖片清單 JSON...');

  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    characters: CHARACTERS.map(c => ({
      id: c.id,
      name: c.name,
      portraits: c.emotions.map(e => `assets/characters/portraits/${c.id}_${c.name}_portrait_${e}.svg`),
      avatar: `assets/characters/avatars/${c.id}_${c.name}_avatar.svg`
    })),
    backgrounds: BACKGROUNDS.map(bg => ({
      category: bg.category,
      name: bg.name,
      path: `assets/backgrounds/${bg.category}/bg_${bg.name}.svg`,
      description: bg.desc
    })),
    ui: UI_ELEMENTS.map(el => ({
      name: el.name,
      path: `assets/ui/windows/ui_${el.name}.svg`,
      description: el.desc,
      size: el.size
    }))
  };

  fs.writeFileSync(
    path.join('assets', 'asset-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('  ✓ assets/asset-manifest.json');
}

/**
 * 主函數
 */
function main() {
  console.log('=================================');
  console.log('   遊戲佔位圖片生成器');
  console.log('=================================\n');

  try {
    generateCharacterPortraits();
    generateBackgrounds();
    generateUIElements();
    generateReadme();
    generateManifest();

    console.log('\n=================================');
    console.log('✅ 所有佔位圖片生成完成！');
    console.log('=================================\n');

    console.log('📊 統計：');
    console.log(`  角色立繪：${CHARACTERS.reduce((sum, c) => sum + c.emotions.length, 0)} 張`);
    console.log(`  角色頭像：${CHARACTERS.length} 張`);
    console.log(`  背景圖：${BACKGROUNDS.length} 張`);
    console.log(`  UI元素：${UI_ELEMENTS.length} 個`);
    console.log(`  總計：${
      CHARACTERS.reduce((sum, c) => sum + c.emotions.length + 1, 0) +
      BACKGROUNDS.length +
      UI_ELEMENTS.length
    } 個文件\n`);

    console.log('📁 資源位置：assets/');
    console.log('📄 詳細清單：docs/ASSETS_CHECKLIST.md');
    console.log('📋 JSON清單：assets/asset-manifest.json\n');

  } catch (error) {
    console.error('❌ 錯誤：', error.message);
    process.exit(1);
  }
}

// 執行
if (require.main === module) {
  main();
}

module.exports = { generateSVG, CHARACTERS, BACKGROUNDS, UI_ELEMENTS };
