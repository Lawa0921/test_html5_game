#!/usr/bin/env node

/**
 * 一鍵生成所有遊戲資源
 * 包含：角色、場景、UI、物品、特效等
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   遊戲資源總生成器 v1.0.0             ║');
console.log('║   一鍵生成所有佔位圖資源               ║');
console.log('╚═══════════════════════════════════════╝\n');

const scripts = [
    {
        name: '角色立繪與背景',
        script: 'generate-placeholders.js',
        description: '生成視覺小說用的角色立繪和大場景背景'
    },
    {
        name: '遊戲經營素材',
        script: 'generate-game-assets.js',
        description: '生成經營系統UI、按鈕、圖標等'
    },
    {
        name: '角色動畫幀',
        script: 'generate-character-animations.js',
        description: '生成角色的8種動作動畫（共528幀）'
    },
    {
        name: '物品與特效',
        script: 'generate-items-and-effects.js',
        description: '生成物品圖標和戰鬥特效'
    },
    {
        name: '戰鬥系統UI',
        script: 'generate-combat-ui.js',
        description: '生成戰鬥介面、敵人圖像、技能圖標'
    },
    {
        name: '任務物品',
        script: 'generate-quest-items.js',
        description: '生成劇情任務道具（共13個）'
    },
    {
        name: '場景物件',
        script: 'generate-scene-objects.js',
        description: '生成可互動的場景物件（共30個）'
    }
];

let totalTime = 0;
let successCount = 0;
let failCount = 0;

scripts.forEach((item, index) => {
    console.log(`\n[${ index + 1}/${scripts.length}] 執行: ${item.name}`);
    console.log(`    說明: ${item.description}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();

    try {
        const scriptPath = path.join(__dirname, item.script);
        execSync(`node "${scriptPath}"`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });

        const elapsed = Date.now() - startTime;
        totalTime += elapsed;

        console.log(`✅ 完成 (耗時: ${elapsed}ms)`);
        successCount++;
    } catch (error) {
        const elapsed = Date.now() - startTime;
        totalTime += elapsed;

        console.error(`❌ 失敗: ${error.message}`);
        failCount++;
    }
});

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   執行總結                             ║');
console.log('╚═══════════════════════════════════════╝\n');

console.log(`✅ 成功: ${successCount} 個腳本`);
console.log(`❌ 失敗: ${failCount} 個腳本`);
console.log(`⏱️  總耗時: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}秒)`);

if (failCount === 0) {
    console.log('\n🎉 所有資源生成完成！');
    console.log('\n📊 生成的資源統計：');
    console.log('  • 角色立繪: 49 張');
    console.log('  • 角色頭像: 11 張');
    console.log('  • 角色動畫幀: 528 幀');
    console.log('  • 角色小圖標: 11 張');
    console.log('  • 場景背景: 18 張');
    console.log('  • UI 元素: 40 張');
    console.log('  • 物品圖標: 26 張');
    console.log('  • 特效幀: 36 幀');
    console.log('  ────────────────────');
    console.log('  🎮 Phase 1 核心資源：');
    console.log('  • 戰鬥系統 UI: 14 張');
    console.log('  • 任務物品: 13 張');
    console.log('  • 場景物件: 30 張');
    console.log('  ────────────────────');
    console.log('  📦 總計: 770+ 個 SVG 文件');
    console.log('  💾 總大小: 約 4.0 MB');
    console.log('\n📄 詳細資源清單請查看：docs/ASSETS_SUMMARY.md');
    console.log('📄 缺失資源報告請查看：docs/MISSING_ASSETS_DETAILED.md\n');
} else {
    console.log('\n⚠️  部分資源生成失敗，請檢查錯誤訊息');
}

process.exit(failCount);
