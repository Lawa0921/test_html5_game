/**
 * 悅來客棧 - 遊戲主程式
 * 2.5D 中式客棧經營掛機遊戲
 */

// 導入核心系統
const GameState = require('./src/core/GameState');
const TimeManager = require('./src/managers/TimeManager');

// 導入場景
const ExteriorScene = require('./src/scenes/ExteriorScene');
const LobbyScene = require('./src/scenes/LobbyScene');
const StoryScene = require('./src/scenes/StoryScene');

// 初始化遊戲狀態
console.log('🏮 初始化遊戲狀態...');
const gameState = new GameState();

// 初始化時間管理器
console.log('⏰ 初始化時間系統...');
const timeManager = new TimeManager();

// Phaser 3 遊戲配置
const config = {
    type: Phaser.AUTO,
    width: 300,   // 初始為小視窗模式（客棧外觀）
    height: 400,
    parent: 'game-container',
    transparent: true,  // 透明背景

    // 物理引擎配置
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    // 場景列表
    scene: [
        StoryScene,     // 視覺小說場景
        ExteriorScene,  // 客棧外觀場景（小視窗）
        LobbyScene      // 客棧大廳場景（大視窗）
    ],

    // 渲染配置
    render: {
        transparent: true,
        antialias: true,
        roundPixels: true
    },

    // 縮放模式
    scale: {
        mode: Phaser.Scale.NONE,  // 禁用自動縮放，由視窗控制
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 創建遊戲實例
console.log('🎮 啟動 Phaser 引擎...');
const game = new Phaser.Game(config);

// 傳遞遊戲狀態到第一個場景
game.scene.start('ExteriorScene', {
    gameState: gameState,
    timeManager: timeManager
});

// 全局遊戲狀態（供調試使用）
window.innGame = {
    game: game,
    gameState: gameState,
    timeManager: timeManager,
    version: '2.0.0',
    settings: {
        volume: 1.0,
        language: 'zh-TW',
        autoSave: true
    }
};

// 監聽視窗大小變化（從 Electron）
const { ipcRenderer } = require('electron');
ipcRenderer.on('window-size-changed', (event, { mode, width, height }) => {
    console.log(`📐 視窗模式切換: ${mode} (${width}x${height})`);

    // 調整 Phaser 畫布大小
    game.scale.resize(width, height);

    // 通知當前活動場景視窗已變化
    const activeScenes = game.scene.getScenes(true);
    activeScenes.forEach(scene => {
        if (scene.onWindowResize) {
            scene.onWindowResize(width, height, mode);
        }
    });
});

// 自動存檔（每30秒）
setInterval(() => {
    if (window.innGame.settings.autoSave) {
        gameState.save();
        console.log('💾 自動存檔完成');
    }
}, 30000);

// 隱藏載入畫面
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 1000);
    }
});

// 錯誤處理
window.addEventListener('error', (event) => {
    console.error('❌ 遊戲錯誤:', event.error);
});

// 退出前存檔
window.addEventListener('beforeunload', () => {
    gameState.save();
    console.log('💾 退出前存檔完成');
});

// 啟動訊息
console.log('');
console.log('═══════════════════════════════════════');
console.log('🏮 悅來客棧 v2.0 - 已啟動');
console.log('═══════════════════════════════════════');
console.log(`渲染器: ${game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'}`);
console.log('透明視窗: 已啟用');
console.log(`初始時間: ${timeManager.getTimeString()}`);
console.log(`天氣: ${timeManager.currentTime.weather} ${timeManager.getWeatherIcon()}`);
console.log(`季節: ${timeManager.currentTime.season}`);
console.log('');
console.log('💡 遊戲提示:');
console.log('  - 點擊客棧外觀進入內部管理');
console.log('  - Ctrl+Shift+D 顯示/隱藏視窗');
console.log('  - Ctrl+Shift+Q 退出遊戲');
console.log('═══════════════════════════════════════');
console.log('');

// 開發模式調試工具
if (process.env.NODE_ENV === 'development' || process.argv.includes('--watch')) {
    console.log('🔧 開發模式已啟用');
    console.log('');
    console.log('調試命令:');
    console.log('  window.innGame.gameState - 查看遊戲狀態');
    console.log('  window.innGame.timeManager - 查看時間系統');
    console.log('  window.innGame.timeManager.getSummary() - 時間摘要');
    console.log('  window.innGame.timeManager.speedUp(10) - 加速時間');
    console.log('  window.innGame.gameState.addSilver(1000) - 增加銀兩');
    console.log('');
}
