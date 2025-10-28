/**
 * 生成遊戲流程所需的佔位符素材
 *
 * 遊戲流程：intro → workAssignment → menuSetup → operating → settlement → night → sleep
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 確保目錄存在
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 創建純色佔位符圖片
function createPlaceholder(width, height, color, text, outputPath) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 填充背景
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // 繪製邊框
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, width, height);

  // 繪製文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // 繪製尺寸信息
  ctx.font = '16px Arial';
  ctx.fillText(`${width}x${height}`, width / 2, height / 2 + 30);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ 創建: ${outputPath}`);
}

// ==================== 1. 開場劇情場景素材 ====================
console.log('\n【1. 開場劇情場景】IntroStoryScene');

const introDir = 'assets/scenes/intro';
ensureDir(introDir);

// 背景
createPlaceholder(1280, 720, '#8B4513', '破舊客棧外觀', `${introDir}/inn-exterior-rundown.png`);
createPlaceholder(1280, 720, '#2F4F4F', '客棧內部 - 荒廢', `${introDir}/inn-interior-abandoned.png`);

// 角色立繪（對話用）
const portraitDir = 'assets/portraits';
ensureDir(portraitDir);

createPlaceholder(400, 600, '#FF6B6B', '林修然立繪\n（主角）', `${portraitDir}/001-linxiuran-neutral.png`);
createPlaceholder(400, 600, '#FFB6C1', '林語嫣立繪\n（妹妹）', `${portraitDir}/002-linyuyan-neutral.png`);
createPlaceholder(400, 600, '#FF6B6B', '林修然 - 驚訝', `${portraitDir}/001-linxiuran-surprised.png`);
createPlaceholder(400, 600, '#FFB6C1', '林語嫣 - 微笑', `${portraitDir}/002-linyuyan-smile.png`);

// 對話框 UI
const uiDir = 'assets/ui';
ensureDir(uiDir);

createPlaceholder(1200, 200, 'rgba(0,0,0,0.7)', '對話框背景', `${uiDir}/dialogue-box.png`);
createPlaceholder(100, 100, '#4CAF50', '繼續按鈕', `${uiDir}/button-continue.png`);
createPlaceholder(100, 100, '#F44336', '跳過按鈕', `${uiDir}/button-skip.png`);

// ==================== 2. 工作分配場景素材 ====================
console.log('\n【2. 工作分配場景】WorkAssignmentScene');

const workAssignDir = 'assets/scenes/work-assignment';
ensureDir(workAssignDir);

// 背景
createPlaceholder(1280, 720, '#3E2723', '工作分配界面背景', `${workAssignDir}/background.png`);

// 角色頭像（方形）
const avatarDir = 'assets/avatars';
ensureDir(avatarDir);

createPlaceholder(128, 128, '#FF6B6B', '林修然\n頭像', `${avatarDir}/001-linxiuran.png`);
createPlaceholder(128, 128, '#FFB6C1', '林語嫣\n頭像', `${avatarDir}/002-linyuyan.png`);
createPlaceholder(128, 128, '#DDA0DD', '秦婉柔\n頭像', `${avatarDir}/011-qinwanrou.png`);

// 工作類型圖標
const jobIconDir = 'assets/icons/jobs';
ensureDir(jobIconDir);

const jobs = [
  { id: 'cooking', name: '烹飪', color: '#FF5722' },
  { id: 'serving', name: '服務', color: '#2196F3' },
  { id: 'cleaning', name: '清潔', color: '#4CAF50' },
  { id: 'accounting', name: '記賬', color: '#9C27B0' },
  { id: 'greeting', name: '迎賓', color: '#FF9800' },
  { id: 'security', name: '保安', color: '#607D8B' },
  { id: 'prep', name: '備菜', color: '#F44336' },
  { id: 'performing', name: '表演', color: '#E91E63' }
];

jobs.forEach(job => {
  createPlaceholder(64, 64, job.color, job.name, `${jobIconDir}/${job.id}-icon.png`);
});

// UI 元素
createPlaceholder(300, 80, '#4CAF50', '確認分配按鈕', `${uiDir}/button-confirm-assignment.png`);
createPlaceholder(300, 80, '#FFC107', '使用昨日分配', `${uiDir}/button-use-yesterday.png`);
createPlaceholder(400, 300, 'rgba(0,0,0,0.8)', '角色詳細面板', `${uiDir}/panel-character-detail.png`);

// ==================== 3. 菜單設置場景素材 ====================
console.log('\n【3. 菜單設置場景】MenuSetupScene');

const menuSetupDir = 'assets/scenes/menu-setup';
ensureDir(menuSetupDir);

createPlaceholder(1280, 720, '#4E342E', '菜單設置背景', `${menuSetupDir}/background.png`);

// 菜品圖標
const dishIconDir = 'assets/icons/dishes';
ensureDir(dishIconDir);

const dishes = [
  { id: 'dish_001', name: '紅燒肉', color: '#D32F2F' },
  { id: 'dish_002', name: '清蒸魚', color: '#1976D2' },
  { id: 'dish_003', name: '宮保雞丁', color: '#F57C00' },
  { id: 'dish_004', name: '麻婆豆腐', color: '#C62828' },
  { id: 'dish_005', name: '酸辣湯', color: '#E64A19' }
];

dishes.forEach(dish => {
  createPlaceholder(128, 128, dish.color, dish.name, `${dishIconDir}/${dish.id}.png`);
});

createPlaceholder(300, 80, '#4CAF50', '完成設置按鈕', `${uiDir}/button-finish-menu-setup.png`);

// ==================== 4. 主遊戲場景素材 ====================
console.log('\n【4. 主遊戲場景】MainOperationScene');

const mainGameDir = 'assets/scenes/main-game';
ensureDir(mainGameDir);

// 客棧區域背景
createPlaceholder(1280, 720, '#8D6E63', '客棧大廳', `${mainGameDir}/lobby.png`);
createPlaceholder(1280, 720, '#FFEB3B', '廚房區域', `${mainGameDir}/kitchen.png`);
createPlaceholder(1280, 720, '#BBDEFB', '客房區域', `${mainGameDir}/rooms.png`);
createPlaceholder(1280, 720, '#C8E6C9', '後院', `${mainGameDir}/backyard.png`);

// NPC 客人 Spritesheet
const npcDir = 'assets/sprites/npcs';
ensureDir(npcDir);

createPlaceholder(192, 64, '#FFB74D', 'NPC客人1\n(3幀動畫)', `${npcDir}/guest-01-walk.png`);
createPlaceholder(192, 64, '#81C784', 'NPC客人2\n(3幀動畫)', `${npcDir}/guest-02-walk.png`);
createPlaceholder(192, 64, '#64B5F6', 'NPC客人3\n(3幀動畫)', `${npcDir}/guest-03-walk.png`);
createPlaceholder(192, 64, '#BA68C8', 'VIP客人\n(3幀動畫)', `${npcDir}/guest-vip-walk.png`);

// 主 UI HUD
createPlaceholder(1280, 80, 'rgba(0,0,0,0.6)', '頂部 HUD 條', `${uiDir}/hud-top-bar.png`);
createPlaceholder(64, 64, '#FFD700', '金錢圖標', `${uiDir}/icon-gold.png`);
createPlaceholder(64, 64, '#F48FB1', '聲譽圖標', `${uiDir}/icon-reputation.png`);
createPlaceholder(64, 64, '#90CAF9', '時間圖標', `${uiDir}/icon-time.png`);

// 狀態圖標
const statusIconDir = 'assets/icons/status';
ensureDir(statusIconDir);

createPlaceholder(48, 48, '#E91E63', '心相圖標', `${statusIconDir}/mood-icon.png`);
createPlaceholder(48, 48, '#9E9E9E', '疲勞圖標', `${statusIconDir}/fatigue-icon.png`);
createPlaceholder(48, 48, '#4CAF50', '工作中標記', `${statusIconDir}/working-icon.png`);

// ==================== 5. 結算場景素材 ====================
console.log('\n【5. 結算場景】SettlementScene');

const settlementDir = 'assets/scenes/settlement';
ensureDir(settlementDir);

createPlaceholder(1280, 720, '#1A237E', '結算背景', `${settlementDir}/background.png`);
createPlaceholder(800, 600, 'rgba(255,255,255,0.9)', '結算面板', `${settlementDir}/settlement-panel.png`);

// 圖表元素
createPlaceholder(600, 300, '#E3F2FD', '收支圖表背景', `${settlementDir}/chart-background.png`);
createPlaceholder(64, 64, '#4CAF50', '收入圖標', `${settlementDir}/icon-income.png`);
createPlaceholder(64, 64, '#F44336', '支出圖標', `${settlementDir}/icon-expense.png`);
createPlaceholder(64, 64, '#FF9800', '材料圖標', `${settlementDir}/icon-materials.png`);

createPlaceholder(300, 80, '#4CAF50', '進入夜晚按鈕', `${uiDir}/button-enter-night.png`);

// ==================== 6. 夜晚場景素材 ====================
console.log('\n【6. 夜晚場景】NightScene');

const nightDir = 'assets/scenes/night';
ensureDir(nightDir);

createPlaceholder(1280, 720, '#0D47A1', '夜晚客棧內部', `${nightDir}/inn-interior-night.png`);
createPlaceholder(1280, 720, '#1A237E', '月光庭院', `${nightDir}/courtyard-night.png`);

// 互動選項 UI
createPlaceholder(400, 120, '#3F51B5', '聊天選項卡', `${uiDir}/card-chat.png`);
createPlaceholder(400, 120, '#E91E63', '教學相長卡', `${uiDir}/card-learning.png`);
createPlaceholder(400, 120, '#00BCD4', '休息選項卡', `${uiDir}/card-rest.png`);

createPlaceholder(300, 80, '#9C27B0', '睡覺按鈕', `${uiDir}/button-sleep.png`);

// 好感度 UI
createPlaceholder(400, 60, 'rgba(255,20,147,0.8)', '好感度條', `${uiDir}/affection-bar.png`);
createPlaceholder(48, 48, '#FF1493', '愛心圖標', `${uiDir}/icon-heart.png`);

// ==================== 7. 通用 UI 元素 ====================
console.log('\n【7. 通用 UI 元素】');

// 按鈕通用
createPlaceholder(200, 60, '#4CAF50', '確定按鈕', `${uiDir}/button-confirm.png`);
createPlaceholder(200, 60, '#F44336', '取消按鈕', `${uiDir}/button-cancel.png`);
createPlaceholder(200, 60, '#2196F3', '返回按鈕', `${uiDir}/button-back.png`);

// 面板通用
createPlaceholder(600, 400, 'rgba(0,0,0,0.85)', '通用面板背景', `${uiDir}/panel-background.png`);
createPlaceholder(800, 100, 'rgba(33,33,33,0.9)', '頂部標題欄', `${uiDir}/panel-header.png`);

// 進度條
createPlaceholder(300, 30, '#757575', '進度條底', `${uiDir}/progress-bar-bg.png`);
createPlaceholder(300, 30, '#4CAF50', '進度條填充', `${uiDir}/progress-bar-fill.png`);

// 通知框
createPlaceholder(400, 100, 'rgba(76,175,80,0.9)', '成功通知', `${uiDir}/notification-success.png`);
createPlaceholder(400, 100, 'rgba(255,152,0,0.9)', '警告通知', `${uiDir}/notification-warning.png`);
createPlaceholder(400, 100, 'rgba(244,67,54,0.9)', '錯誤通知', `${uiDir}/notification-error.png`);

// ==================== 8. 音效佔位符 ====================
console.log('\n【8. 音效素材】（需要實際音頻文件）');

const audioDir = 'assets/audio';
ensureDir(audioDir);
ensureDir(`${audioDir}/bgm`);
ensureDir(`${audioDir}/sfx`);

// 創建音效佔位符文件（空文件）
const audioPlaceholders = [
  // BGM
  'bgm/intro-story.mp3',
  'bgm/work-assignment.mp3',
  'bgm/day-operation.mp3',
  'bgm/settlement.mp3',
  'bgm/night-time.mp3',

  // SFX
  'sfx/click.mp3',
  'sfx/confirm.mp3',
  'sfx/cancel.mp3',
  'sfx/coin.mp3',
  'sfx/guest-arrive.mp3',
  'sfx/guest-leave.mp3',
  'sfx/cooking.mp3',
  'sfx/notification.mp3',
  'sfx/level-up.mp3',
  'sfx/affection-up.mp3'
];

audioPlaceholders.forEach(file => {
  const filePath = path.join(audioDir, file);
  fs.writeFileSync(filePath, '// Audio placeholder - replace with actual audio file\n');
  console.log(`✓ 創建音效佔位: ${filePath}`);
});

// ==================== 9. 字體佔位符 ====================
console.log('\n【9. 字體資源】');

const fontsDir = 'assets/fonts';
ensureDir(fontsDir);

fs.writeFileSync(
  `${fontsDir}/README.md`,
  `# 字體資源

## 需要的字體

### 1. 標題字體
- 用途：遊戲標題、場景標題
- 建議：粗黑體或書法字體
- 格式：.ttf 或 .otf

### 2. 正文字體
- 用途：對話、UI 文字
- 建議：微軟正黑體或思源黑體
- 格式：.ttf 或 .otf

### 3. 數字字體
- 用途：金錢、時間顯示
- 建議：等寬字體
- 格式：.ttf 或 .otf

## 注意事項
- 確保字體包含完整中文字符集
- 注意字體授權問題
- 字體文件不要太大（< 5MB）
`
);

console.log('\n✅ 所有佔位符素材生成完成！');
console.log('\n📋 請查看 docs/ASSET_CHECKLIST.md 了解素材清單');
