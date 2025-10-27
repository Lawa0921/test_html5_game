#!/usr/bin/env node

/**
 * 角色資源完整性驗證工具
 * 檢查指定角色的所有必需資源是否存在且符合規範
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   角色資源完整性驗證工具               ║');
console.log('╚═══════════════════════════════════════╝\n');

// 獲取角色 ID（命令行參數）
const characterId = process.argv[2];

if (!characterId) {
    console.error('❌ 錯誤: 請提供角色 ID');
    console.log('\n使用方式: node scripts/validate-character-assets.js {characterId}');
    console.log('範例: node scripts/validate-character-assets.js 001\n');
    process.exit(1);
}

// 資源規範定義
const ASSET_SCHEMA = {
    portraits: {
        required: ['normal', 'smile', 'sad'],
        optional: ['angry', 'happy', 'surprised', 'shy', 'serious', 'determined', 'crying', 'scared', 'cooking', 'cold', 'playing', 'killer', 'pout', 'excited', 'fighting'],
        minCount: 3,
        path: 'assets/characters/portraits',
        pattern: '{id}_{name}_portrait_{emotion}.svg',
        size: '800×1200px'
    },
    avatar: {
        required: true,
        path: 'assets/characters/avatars',
        pattern: '{id}_{name}_avatar.svg',
        size: '64×64px'
    },
    animations: {
        actions: ['idle', 'work', 'rest', 'sleep', 'walk_up', 'walk_down', 'walk_left', 'walk_right'],
        framesPerAction: 6,
        path: 'assets/animations',
        pattern: '{id}/[action]/{action}_{frame}.svg',
        size: '64×64px'
    },
    sprite: {
        required: true,
        path: 'assets/sprites',
        pattern: 'sprite-{index}.svg',
        size: '32×32px'
    }
};

// 讀取角色數據
let characterName = null;
let spriteIndex = null;

try {
    const manifest = require('../assets/asset-manifest.json');
    const character = manifest.characters.find(c => c.id === characterId);

    if (!character) {
        console.error(`❌ 錯誤: 在 asset-manifest.json 中找不到角色 ID: ${characterId}`);
        console.log('\n💡 請先在 asset-manifest.json 中註冊此角色\n');
        process.exit(1);
    }

    characterName = character.name;
    spriteIndex = manifest.characters.findIndex(c => c.id === characterId);
} catch (error) {
    console.error('❌ 錯誤: 無法讀取 asset-manifest.json');
    console.error(error.message);
    process.exit(1);
}

console.log(`驗證角色: ${characterId} - ${characterName}\n`);
console.log('─'.repeat(60));

// 驗證結果統計
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
};

// 檢查文件是否存在
function checkFile(filePath, description) {
    const fullPath = path.join(__dirname, '..', filePath);
    const exists = fs.existsSync(fullPath);

    return {
        exists,
        path: filePath,
        description
    };
}

// 1. 檢查立繪（Portraits）
console.log('\n📸 檢查角色立繪...');
const portraitsPath = ASSET_SCHEMA.portraits.path;
const foundPortraits = [];
const missingPortraits = [];

ASSET_SCHEMA.portraits.required.forEach(emotion => {
    const fileName = `${characterId}_${characterName}_portrait_${emotion}.svg`;
    const filePath = `${portraitsPath}/${fileName}`;
    const result = checkFile(filePath, `${emotion} 表情`);

    if (result.exists) {
        foundPortraits.push(emotion);
        console.log(`  ✓ ${result.description.padEnd(15)} - ${fileName}`);
        results.passed++;
    } else {
        missingPortraits.push(emotion);
        console.log(`  ✗ ${result.description.padEnd(15)} - ${fileName} [缺失]`);
        results.failed++;
    }
});

// 檢查可選立繪
const optionalPortraits = [];
ASSET_SCHEMA.portraits.optional.forEach(emotion => {
    const fileName = `${characterId}_${characterName}_portrait_${emotion}.svg`;
    const filePath = `${portraitsPath}/${fileName}`;
    const result = checkFile(filePath, `${emotion} 表情`);

    if (result.exists) {
        optionalPortraits.push(emotion);
        foundPortraits.push(emotion);
        console.log(`  + ${result.description.padEnd(15)} - ${fileName} [可選]`);
        results.passed++;
    }
});

console.log(`\n  總計: ${foundPortraits.length} 個立繪 (必需: ${ASSET_SCHEMA.portraits.required.length}, 可選: ${optionalPortraits.length})`);

if (foundPortraits.length < ASSET_SCHEMA.portraits.minCount) {
    console.log(`  ⚠️  警告: 立繪數量少於建議的最小值 (${ASSET_SCHEMA.portraits.minCount})`);
    results.warnings++;
}

// 2. 檢查頭像（Avatar）
console.log('\n👤 檢查角色頭像...');
const avatarFileName = `${characterId}_${characterName}_avatar.svg`;
const avatarPath = `${ASSET_SCHEMA.avatar.path}/${avatarFileName}`;
const avatarResult = checkFile(avatarPath, '角色頭像');

if (avatarResult.exists) {
    console.log(`  ✓ ${avatarResult.description.padEnd(15)} - ${avatarFileName}`);
    results.passed++;
} else {
    console.log(`  ✗ ${avatarResult.description.padEnd(15)} - ${avatarFileName} [缺失]`);
    results.failed++;
}

// 3. 檢查動畫幀（Animations）
console.log('\n🎬 檢查角色動畫幀...');
const animationsPath = ASSET_SCHEMA.animations.path;
let totalAnimationFrames = 0;
let missingAnimationFrames = 0;

ASSET_SCHEMA.animations.actions.forEach(action => {
    const actionPath = `${animationsPath}/${characterId}/${action}`;
    let actionFramesFound = 0;

    for (let frame = 0; frame < ASSET_SCHEMA.animations.framesPerAction; frame++) {
        const fileName = `${action}_${frame}.svg`;
        const filePath = `${actionPath}/${fileName}`;
        const result = checkFile(filePath, `${action} 動作`);

        if (result.exists) {
            actionFramesFound++;
            totalAnimationFrames++;
        } else {
            missingAnimationFrames++;
        }
    }

    const status = actionFramesFound === ASSET_SCHEMA.animations.framesPerAction ? '✓' : '✗';
    const statusText = actionFramesFound === ASSET_SCHEMA.animations.framesPerAction ? '' : ' [不完整]';
    console.log(`  ${status} ${action.padEnd(12)} - ${actionFramesFound}/${ASSET_SCHEMA.animations.framesPerAction} 幀${statusText}`);

    if (actionFramesFound === ASSET_SCHEMA.animations.framesPerAction) {
        results.passed++;
    } else {
        results.failed++;
    }
});

const expectedFrames = ASSET_SCHEMA.animations.actions.length * ASSET_SCHEMA.animations.framesPerAction;
console.log(`\n  總計: ${totalAnimationFrames}/${expectedFrames} 個動畫幀`);

if (missingAnimationFrames > 0) {
    console.log(`  ⚠️  缺失 ${missingAnimationFrames} 個動畫幀`);
}

// 4. 檢查小圖標（Sprite）
console.log('\n🎯 檢查角色小圖標...');
const spriteFileName = `sprite-${spriteIndex}.svg`;
const spritePath = `${ASSET_SCHEMA.sprite.path}/${spriteFileName}`;
const spriteResult = checkFile(spritePath, '小圖標');

if (spriteResult.exists) {
    console.log(`  ✓ ${spriteResult.description.padEnd(15)} - ${spriteFileName}`);
    results.passed++;
} else {
    console.log(`  ✗ ${spriteResult.description.padEnd(15)} - ${spriteFileName} [缺失]`);
    results.failed++;
}

// 5. 檢查 manifest 註冊
console.log('\n📋 檢查 asset-manifest.json 註冊...');
try {
    const manifest = require('../assets/asset-manifest.json');
    const character = manifest.characters.find(c => c.id === characterId);

    if (character) {
        console.log(`  ✓ 角色已在 manifest 中註冊`);
        console.log(`  ✓ 名稱: ${character.name}`);
        console.log(`  ✓ 立繪數量: ${character.portraits.length}`);
        console.log(`  ✓ 頭像路徑: ${character.avatar}`);
        results.passed++;
    }
} catch (error) {
    console.log(`  ✗ manifest 註冊檢查失敗: ${error.message}`);
    results.failed++;
}

// ==================== 總結報告 ====================

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   驗證結果總結                         ║');
console.log('╚═══════════════════════════════════════╝\n');

const totalChecks = results.passed + results.failed;
const passRate = ((results.passed / totalChecks) * 100).toFixed(1);

console.log(`通過: ${results.passed}/${totalChecks} (${passRate}%)`);
console.log(`失敗: ${results.failed}`);
console.log(`警告: ${results.warnings}`);

if (results.failed === 0 && results.warnings === 0) {
    console.log('\n🎉 完美！所有資源檢查通過！');
    console.log(`\n角色 ${characterId} - ${characterName} 的資源已完整準備。\n`);
    process.exit(0);
} else if (results.failed === 0) {
    console.log('\n✅ 所有必需資源已存在，但有一些建議改進項目。');
    console.log(`\n角色 ${characterId} - ${characterName} 的資源基本完整。\n`);
    process.exit(0);
} else {
    console.log('\n❌ 資源檢查未通過，請補充缺失的資源。');
    console.log('\n缺失資源：');

    if (missingPortraits.length > 0) {
        console.log(`  • 立繪: ${missingPortraits.join(', ')}`);
    }

    if (!avatarResult.exists) {
        console.log(`  • 頭像`);
    }

    if (missingAnimationFrames > 0) {
        console.log(`  • 動畫幀: ${missingAnimationFrames} 個`);
    }

    if (!spriteResult.exists) {
        console.log(`  • 小圖標`);
    }

    console.log('\n📖 請參考文檔: docs/ASSET_SCHEMA.md\n');
    process.exit(1);
}
