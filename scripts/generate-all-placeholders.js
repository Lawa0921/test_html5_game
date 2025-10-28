/**
 * 生成所有缺失的素材佔位符
 *
 * 根據 COMPLETE_ASSET_LIST.md 生成所有 [ ] 標註的素材
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 顏色方案
const COLORS = {
  PRIMARY: '#1a1a2e',
  SECONDARY: '#16213e',
  ACCENT: '#0f3460',
  HIGHLIGHT: '#e94560',
  TEXT: '#ffffff',
  BORDER: '#3a506b',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  ERROR: '#dc3545',
  INFO: '#17a2b8'
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
 * 生成基礎佔位符圖片
 */
function generatePlaceholder(width, height, text, color = COLORS.SECONDARY, textColor = COLORS.TEXT) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // 邊框
  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, width, height);

  // 文字
  ctx.fillStyle = textColor;
  const fontSize = Math.min(width, height) / 8;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 多行文字處理
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.2;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  // 尺寸標註
  ctx.font = `${fontSize / 2}px Arial`;
  ctx.fillStyle = COLORS.TEXT;
  ctx.globalAlpha = 0.7;
  ctx.fillText(`${width}x${height}`, width / 2, height - fontSize);
  ctx.globalAlpha = 1.0;

  return canvas;
}

/**
 * 生成精靈圖（多幀動畫）
 */
function generateSpriteSheet(frameWidth, frameHeight, frameCount, text) {
  const width = frameWidth * frameCount;
  const height = frameHeight;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = COLORS.SECONDARY;
  ctx.fillRect(0, 0, width, height);

  // 為每一幀繪製
  for (let i = 0; i < frameCount; i++) {
    const x = i * frameWidth;

    // 幀邊框
    ctx.strokeStyle = COLORS.BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 0, frameWidth, frameHeight);

    // 幀號
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = `bold ${frameHeight / 6}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(`Frame ${i + 1}`, x + frameWidth / 2, frameHeight / 4);

    // 簡單動畫表示（圓形位置變化）
    const circleRadius = frameHeight / 10;
    const circleY = frameHeight / 2;
    const circleX = x + frameWidth / 4 + (frameWidth / 2) * (i / (frameCount - 1 || 1));

    ctx.fillStyle = COLORS.HIGHLIGHT;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 標註
  ctx.fillStyle = COLORS.TEXT;
  ctx.font = `${frameHeight / 8}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, frameHeight - frameHeight / 10);
  ctx.fillText(`${frameCount} frames`, width / 2, frameHeight - frameHeight / 5);

  return canvas;
}

/**
 * 保存 canvas 到文件
 */
function saveCanvas(canvas, outputPath) {
  ensureDir(path.dirname(outputPath));
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

// =================================================================
// 素材生成函數
// =================================================================

/**
 * 生成場景背景
 */
function generateScenes() {
  console.log('\n【場景背景】');

  const scenes = [
    { path: 'scenes/main-game/storage.png', name: '儲藏室' },
    { path: 'scenes/main-game/garden.png', name: '菜園' },
    { path: 'scenes/combat/combat-background.png', name: '戰鬥背景' },
    { path: 'scenes/combat/victory-background.png', name: '勝利背景' },
    { path: 'scenes/trade/market-background.png', name: '市場背景' },
    { path: 'scenes/learning/training-room.png', name: '訓練室' }
  ];

  scenes.forEach(scene => {
    const canvas = generatePlaceholder(1280, 720, `[${scene.name}]`, COLORS.PRIMARY);
    const outputPath = path.join(__dirname, '../assets', scene.path);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${scene.name}: ${outputPath}`);
  });
}

/**
 * 生成 UI 元素
 */
function generateUI() {
  console.log('\n【UI 元素】');

  const buttons = [
    { name: 'button-save.png', text: '保存', color: COLORS.SUCCESS },
    { name: 'button-load.png', text: '讀取', color: COLORS.INFO },
    { name: 'button-delete.png', text: '刪除', color: COLORS.ERROR }
  ];

  buttons.forEach(btn => {
    const canvas = generatePlaceholder(200, 60, btn.text, btn.color);
    const outputPath = path.join(__dirname, '../assets/ui', btn.name);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${btn.text}按鈕: ${outputPath}`);
  });

  // 進度條
  const progressBars = [
    { name: 'exp-bar-bg.png', text: 'EXP BAR\nBG' },
    { name: 'exp-bar-fill.png', text: 'EXP BAR\nFILL', color: COLORS.SUCCESS },
    { name: 'hp-bar-bg.png', text: 'HP BAR\nBG' },
    { name: 'hp-bar-fill.png', text: 'HP BAR\nFILL', color: COLORS.ERROR }
  ];

  progressBars.forEach(bar => {
    const canvas = generatePlaceholder(300, 30, bar.text, bar.color || COLORS.ACCENT);
    const outputPath = path.join(__dirname, '../assets/ui', bar.name);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${bar.name}: ${outputPath}`);
  });

  // 通知
  const canvas = generatePlaceholder(400, 100, 'INFO', COLORS.INFO);
  const outputPath = path.join(__dirname, '../assets/ui/notification-info.png');
  saveCanvas(canvas, outputPath);
  console.log(`✓ 資訊通知: ${outputPath}`);

  // 夜晚活動卡片
  const cards = [
    { name: 'card-training.png', text: '訓練' },
    { name: 'card-gift.png', text: '送禮' }
  ];

  cards.forEach(card => {
    const canvas = generatePlaceholder(200, 280, card.text, COLORS.ACCENT);
    const outputPath = path.join(__dirname, '../assets/ui', card.name);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${card.text}卡片: ${outputPath}`);
  });

  // 選項界面控件
  const controls = [
    { name: 'slider-track.png', width: 300, height: 20, text: 'TRACK' },
    { name: 'slider-thumb.png', width: 30, height: 30, text: '⬤' },
    { name: 'checkbox-unchecked.png', width: 40, height: 40, text: '☐' },
    { name: 'checkbox-checked.png', width: 40, height: 40, text: '☑' },
    { name: 'radio-unchecked.png', width: 40, height: 40, text: '○' },
    { name: 'radio-checked.png', width: 40, height: 40, text: '●' }
  ];

  controls.forEach(ctrl => {
    const canvas = generatePlaceholder(ctrl.width, ctrl.height, ctrl.text, COLORS.ACCENT);
    const outputPath = path.join(__dirname, '../assets/ui', ctrl.name);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${ctrl.name}: ${outputPath}`);
  });
}

/**
 * 生成角色素材
 */
function generateCharacters() {
  console.log('\n【角色素材】');

  // 頭像
  for (let i = 3; i <= 5; i++) {
    const id = String(i).padStart(3, '0');
    const canvas = generatePlaceholder(128, 128, `角色${i}`, COLORS.ACCENT);
    const outputPath = path.join(__dirname, `../assets/avatars/${id}-character${i}.png`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ 角色${i}頭像: ${outputPath}`);
  }

  // 立繪
  const portraits = [
    { id: '001', name: '林秀然', emotion: 'happy', text: '開心' },
    { id: '001', name: '林秀然', emotion: 'sad', text: '悲傷' },
    { id: '002', name: '林雨燕', emotion: 'angry', text: '生氣' },
    { id: '011', name: '秦婉柔', emotion: 'neutral', text: '普通' },
    { id: '011', name: '秦婉柔', emotion: 'smile', text: '微笑' }
  ];

  portraits.forEach(p => {
    const canvas = generatePlaceholder(400, 600, `${p.name}\n${p.text}`, COLORS.SECONDARY);
    const outputPath = path.join(__dirname, `../assets/portraits/${p.id}-${p.name.toLowerCase()}-${p.emotion}.png`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${p.name}(${p.text}): ${outputPath}`);
  });

  // 工作動畫精靈圖
  const animations = [
    { name: 'greeting', text: '接待', frames: 3 },
    { name: 'cleaning', text: '清潔', frames: 6 },
    { name: 'cooking', text: '料理', frames: 6 },
    { name: 'serving', text: '服務', frames: 6 },
    { name: 'prep', text: '備料', frames: 6 },
    { name: 'performing', text: '表演', frames: 6 },
    { name: 'accounting', text: '帳務', frames: 6 },
    { name: 'security', text: '守衛', frames: 6 }
  ];

  animations.forEach(anim => {
    const canvas = generateSpriteSheet(64, 64, anim.frames, anim.text);
    const outputPath = path.join(__dirname, `../assets/sprites/characters/001-${anim.name}.png`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${anim.text}動畫: ${outputPath}`);
  });

  // NPC 動畫
  const npcAnims = [
    { id: '01', type: 'sit', text: '坐下', frames: 2 },
    { id: '02', type: 'sit', text: '坐下', frames: 2 },
    { id: '01', type: 'eat', text: '用餐', frames: 3 }
  ];

  npcAnims.forEach(anim => {
    const canvas = generateSpriteSheet(64, 64, anim.frames, `客人${anim.id}\n${anim.text}`);
    const outputPath = path.join(__dirname, `../assets/sprites/npcs/guest-${anim.id}-${anim.type}.png`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ 客人${anim.id}${anim.text}: ${outputPath}`);
  });
}

/**
 * 生成圖標
 */
function generateIcons() {
  console.log('\n【圖標】');

  // 設施圖標
  const facilities = [
    'lobby', 'kitchen', 'rooms', 'storage', 'backyard',
    'garden', 'workshop', 'training-room', 'stage'
  ];
  const facilityNames = {
    'lobby': '大廳', 'kitchen': '廚房', 'rooms': '客房',
    'storage': '儲藏室', 'backyard': '後院', 'garden': '菜園',
    'workshop': '工坊', 'training-room': '訓練室', 'stage': '舞台'
  };

  facilities.forEach(facility => {
    const canvas = generatePlaceholder(64, 64, facilityNames[facility], COLORS.ACCENT);
    const outputPath = path.join(__dirname, `../assets/icons/facilities/${facility}-icon.png`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${facilityNames[facility]}圖標: ${outputPath}`);
  });

  // 狀態圖標
  const statuses = [
    { name: 'sick-icon.png', text: '生病', color: COLORS.WARNING },
    { name: 'injured-icon.png', text: '受傷', color: COLORS.ERROR },
    { name: 'buff-icon.png', text: '增益', color: COLORS.SUCCESS },
    { name: 'debuff-icon.png', text: '減益', color: COLORS.ERROR }
  ];

  statuses.forEach(status => {
    const canvas = generatePlaceholder(48, 48, status.text, status.color);
    const outputPath = path.join(__dirname, `../assets/icons/status/${status.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${status.text}: ${outputPath}`);
  });

  // 資源圖標
  const resources = [
    { name: 'exp-icon.png', text: 'EXP' },
    { name: 'level-icon.png', text: 'LV' }
  ];

  resources.forEach(res => {
    const canvas = generatePlaceholder(48, 48, res.text, COLORS.SUCCESS);
    const outputPath = path.join(__dirname, `../assets/icons/resources/${res.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${res.text}: ${outputPath}`);
  });

  // 菜品圖標（6-10）
  for (let i = 6; i <= 10; i++) {
    const id = String(i).padStart(3, '0');
    const canvas = generatePlaceholder(64, 64, `菜品${i}`, COLORS.ACCENT);
    const outputPath = path.join(__dirname, `../assets/icons/dishes/dish_${id}.png`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ 菜品${i}: ${outputPath}`);
  }

  // 食材圖標
  const ingredients = [
    'meat', 'vegetable', 'grain', 'seasoning',
    'fish', 'fruit', 'herb', 'special'
  ];
  const ingredientNames = {
    'meat': '肉類', 'vegetable': '蔬菜', 'grain': '穀物', 'seasoning': '調味料',
    'fish': '魚類', 'fruit': '水果', 'herb': '香料', 'special': '特殊食材'
  };

  ingredients.forEach(ing => {
    const canvas = generatePlaceholder(64, 64, ingredientNames[ing], COLORS.ACCENT);
    const outputPath = path.join(__dirname, `../assets/icons/ingredients/${ing}.png`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${ingredientNames[ing]}: ${outputPath}`);
  });

  // 裝備圖標
  const equipment = [
    { name: 'weapon.png', text: '武器' },
    { name: 'armor.png', text: '防具' },
    { name: 'accessory.png', text: '飾品' },
    { name: 'tool.png', text: '工具' }
  ];

  equipment.forEach(eq => {
    const canvas = generatePlaceholder(64, 64, eq.text, COLORS.ACCENT);
    const outputPath = path.join(__dirname, `../assets/icons/equipment/${eq.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${eq.text}: ${outputPath}`);
  });

  // 道具圖標
  const items = [
    { name: 'potion-hp.png', text: 'HP' },
    { name: 'potion-energy.png', text: '體力' },
    { name: 'gift-common.png', text: '禮物' },
    { name: 'gift-rare.png', text: '稀有' },
    { name: 'material.png', text: '材料' }
  ];

  items.forEach(item => {
    const canvas = generatePlaceholder(64, 64, item.text, COLORS.ACCENT);
    const outputPath = path.join(__dirname, `../assets/icons/items/${item.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${item.text}: ${outputPath}`);
  });

  // 科技圖標
  const techs = [
    { name: 'cooking-skill.png', text: '料理' },
    { name: 'service-skill.png', text: '服務' },
    { name: 'management-skill.png', text: '管理' },
    { name: 'combat-skill.png', text: '戰鬥' },
    { name: 'crafting-skill.png', text: '製作' }
  ];

  techs.forEach(tech => {
    const canvas = generatePlaceholder(64, 64, tech.text, COLORS.INFO);
    const outputPath = path.join(__dirname, `../assets/icons/tech/${tech.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${tech.text}技術: ${outputPath}`);
  });

  // 任務/成就圖標
  const quests = [
    { name: 'main-quest.png', text: '主線' },
    { name: 'side-quest.png', text: '支線' },
    { name: 'daily-quest.png', text: '每日' }
  ];

  quests.forEach(quest => {
    const canvas = generatePlaceholder(64, 64, quest.text, COLORS.WARNING);
    const outputPath = path.join(__dirname, `../assets/icons/quests/${quest.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${quest.text}任務: ${outputPath}`);
  });

  const achievements = [
    { name: 'bronze.png', text: '銅牌', color: '#cd7f32' },
    { name: 'silver.png', text: '銀牌', color: '#c0c0c0' },
    { name: 'gold.png', text: '金牌', color: '#ffd700' }
  ];

  achievements.forEach(ach => {
    const canvas = generatePlaceholder(64, 64, ach.text, ach.color);
    const outputPath = path.join(__dirname, `../assets/icons/achievements/${ach.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${ach.text}成就: ${outputPath}`);
  });
}

/**
 * 生成戰鬥相關
 */
function generateCombat() {
  console.log('\n【戰鬥相關】');

  // 戰鬥 UI
  const combatUI = [
    { name: 'hp-bar.png', width: 300, height: 40, text: 'HP BAR' },
    { name: 'action-panel.png', width: 600, height: 200, text: 'ACTION\nPANEL' },
    { name: 'skill-button.png', width: 100, height: 100, text: '技能' },
    { name: 'attack-button.png', width: 100, height: 100, text: '攻擊' },
    { name: 'defend-button.png', width: 100, height: 100, text: '防禦' },
    { name: 'item-button.png', width: 100, height: 100, text: '道具' }
  ];

  combatUI.forEach(ui => {
    const canvas = generatePlaceholder(ui.width, ui.height, ui.text, COLORS.ERROR);
    const outputPath = path.join(__dirname, `../assets/ui/combat/${ui.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${ui.name}: ${outputPath}`);
  });

  // 戰鬥特效
  const effects = [
    { name: 'attack-slash.png', text: '斬擊', frames: 4 },
    { name: 'magic-fire.png', text: '火焰', frames: 4 },
    { name: 'heal-light.png', text: '治療', frames: 4 }
  ];

  effects.forEach(effect => {
    const canvas = generateSpriteSheet(128, 128, effect.frames, effect.text);
    const outputPath = path.join(__dirname, `../assets/effects/${effect.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${effect.text}特效: ${outputPath}`);
  });
}

/**
 * 生成結局 CG
 */
function generateEndings() {
  console.log('\n【結局 CG】');

  const endings = [
    { name: 'ending-01.png', text: '結局 1' },
    { name: 'ending-02.png', text: '結局 2' },
    { name: 'ending-03.png', text: '結局 3' },
    { name: 'ending-bad.png', text: '壞結局' },
    { name: 'ending-true.png', text: '真結局' }
  ];

  endings.forEach(ending => {
    const canvas = generatePlaceholder(1280, 720, `[${ending.text}]`, COLORS.PRIMARY);
    const outputPath = path.join(__dirname, `../assets/cg/${ending.name}`);
    saveCanvas(canvas, outputPath);
    console.log(`✓ ${ending.text}: ${outputPath}`);
  });
}

// =================================================================
// 主函數
// =================================================================

function main() {
  console.log('='.repeat(70));
  console.log('開始生成所有缺失的素材佔位符');
  console.log('='.repeat(70));

  try {
    generateScenes();
    generateUI();
    generateCharacters();
    generateIcons();
    generateCombat();
    generateEndings();

    console.log('\n' + '='.repeat(70));
    console.log('✓ 所有素材佔位符已生成完成！');
    console.log('='.repeat(70));
    console.log('\n請查看 docs/COMPLETE_ASSET_LIST.md 獲取完整素材清單');
  } catch (error) {
    console.error('\n生成失敗：', error);
    process.exit(1);
  }
}

// 執行
if (require.main === module) {
  main();
}

module.exports = {
  generatePlaceholder,
  generateSpriteSheet,
  saveCanvas
};
