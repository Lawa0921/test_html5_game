#!/usr/bin/env node

/**
 * 生成音頻佔位符
 * 為遊戲創建靜音 WAV 文件作為音頻資源佔位符
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   音頻佔位符生成器                     ║');
console.log('╚═══════════════════════════════════════╝\n');

// 確保目錄存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * 生成簡單的靜音 WAV 文件
 * @param {number} duration - 持續時間（秒）
 * @param {number} sampleRate - 採樣率（Hz）
 * @returns {Buffer} WAV 文件的二進制數據
 */
function generateSilentWav(duration = 0.1, sampleRate = 44100) {
    const numChannels = 2; // 立體聲
    const bitsPerSample = 16;
    const numSamples = Math.floor(sampleRate * duration);
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);

    // WAV 文件總大小
    const fileSize = 44 + dataSize;
    const buffer = Buffer.alloc(fileSize);

    let offset = 0;

    // RIFF header
    buffer.write('RIFF', offset); offset += 4;
    buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
    buffer.write('WAVE', offset); offset += 4;

    // fmt chunk
    buffer.write('fmt ', offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4; // fmt chunk size
    buffer.writeUInt16LE(1, offset); offset += 2; // audio format (1 = PCM)
    buffer.writeUInt16LE(numChannels, offset); offset += 2;
    buffer.writeUInt32LE(sampleRate, offset); offset += 4;
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), offset); offset += 4; // byte rate
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), offset); offset += 2; // block align
    buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

    // data chunk
    buffer.write('data', offset); offset += 4;
    buffer.writeUInt32LE(dataSize, offset); offset += 4;

    // 填充靜音數據 (全部為 0)
    buffer.fill(0, offset);

    return buffer;
}

// ==================== 主要生成邏輯 ====================

// 背景音樂定義 (較長的音頻)
const bgmFiles = [
    { filename: 'bgm_menu.wav', name: '主菜單音樂', duration: 2.0 },
    { filename: 'bgm_inn_day.wav', name: '客棧日間音樂', duration: 2.0 },
    { filename: 'bgm_inn_night.wav', name: '客棧夜間音樂', duration: 2.0 },
    { filename: 'bgm_battle.wav', name: '戰鬥音樂', duration: 2.0 },
    { filename: 'bgm_story.wav', name: '劇情音樂', duration: 2.0 },
    { filename: 'bgm_town.wav', name: '城鎮音樂', duration: 2.0 }
];

// 音效定義 (較短的音頻)
const sfxFiles = [
    // UI 音效
    { filename: 'sfx_button_click.wav', name: '按鈕點擊音效', duration: 0.1 },
    { filename: 'sfx_menu_open.wav', name: '菜單打開音效', duration: 0.2 },
    { filename: 'sfx_notification.wav', name: '通知音效', duration: 0.3 },
    { filename: 'sfx_coin.wav', name: '金幣音效', duration: 0.15 },

    // 遊戲音效
    { filename: 'sfx_cooking.wav', name: '烹飪音效', duration: 0.5 },
    { filename: 'sfx_chopping.wav', name: '切菜音效', duration: 0.3 },
    { filename: 'sfx_attack.wav', name: '攻擊音效', duration: 0.2 },
    { filename: 'sfx_hit.wav', name: '命中音效', duration: 0.15 },
    { filename: 'sfx_heal.wav', name: '治療音效', duration: 0.4 },
    { filename: 'sfx_footstep.wav', name: '腳步音效', duration: 0.1 },
    { filename: 'sfx_door.wav', name: '開門音效', duration: 0.3 }
];

const bgmDir = path.join(__dirname, '../assets/audio/bgm');
const sfxDir = path.join(__dirname, '../assets/audio/sfx');

ensureDir(bgmDir);
ensureDir(sfxDir);

let totalGenerated = 0;

console.log('開始生成背景音樂佔位符...\n');

bgmFiles.forEach((bgm, index) => {
    console.log(`[${index + 1}/${bgmFiles.length}] 生成 ${bgm.name}...`);

    const filePath = path.join(bgmDir, bgm.filename);
    const wavData = generateSilentWav(bgm.duration);
    fs.writeFileSync(filePath, wavData);

    const fileSize = (fs.statSync(filePath).size / 1024).toFixed(2);
    console.log(`  ✓ ${bgm.filename} (${fileSize} KB, ${bgm.duration}s)`);
    totalGenerated++;
});

console.log('\n開始生成音效佔位符...\n');

sfxFiles.forEach((sfx, index) => {
    console.log(`[${index + 1}/${sfxFiles.length}] 生成 ${sfx.name}...`);

    const filePath = path.join(sfxDir, sfx.filename);
    const wavData = generateSilentWav(sfx.duration);
    fs.writeFileSync(filePath, wavData);

    const fileSize = (fs.statSync(filePath).size / 1024).toFixed(2);
    console.log(`  ✓ ${sfx.filename} (${fileSize} KB, ${sfx.duration}s)`);
    totalGenerated++;
});

// ==================== 總結 ====================

console.log('\n╔═══════════════════════════════════════╗');
console.log('║   生成完成                             ║');
console.log('╚═══════════════════════════════════════╝\n');

console.log(`✅ 共生成 ${totalGenerated} 個音頻佔位符`);
console.log(`   - ${bgmFiles.length} 個背景音樂 (BGM)`);
console.log(`   - ${sfxFiles.length} 個音效 (SFX)`);

console.log(`\n📂 生成位置:`);
console.log(`   BGM: ${bgmDir}`);
console.log(`   SFX: ${sfxDir}`);

console.log('\n📋 背景音樂:');
bgmFiles.forEach(bgm => {
    console.log(`   • ${bgm.name} - ${bgm.filename}`);
});

console.log('\n📋 音效:');
sfxFiles.forEach(sfx => {
    console.log(`   • ${sfx.name} - ${sfx.filename}`);
});

console.log('\n✨ 所有音頻佔位符已生成完成！');
console.log('   格式: WAV (PCM, 44.1kHz, 16-bit, Stereo)');
console.log('   這些靜音文件可以被遊戲正常載入，稍後可替換為實際音頻。\n');

console.log('💡 提示:');
console.log('   - 這些是靜音 WAV 文件，可確保遊戲不會因缺少音頻而報錯');
console.log('   - 後續可以替換為實際的 MP3/OGG 音頻文件');
console.log('   - WAV 格式兼容性最好，適合作為佔位符\n');
