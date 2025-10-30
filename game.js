/**
 * 悅來客棧 - 遊戲主程式
 * 治癒系客棧經營管理遊戲
 */

// 導入核心系統
const GameState = require('./src/core/GameState');

// 導入場景
const BootScene = require('./src/scenes/BootScene');
const SplashScene = require('./src/scenes/SplashScene');
const MainMenuScene = require('./src/scenes/MainMenuScene');
const ExteriorScene = require('./src/scenes/ExteriorScene');
const LobbyScene = require('./src/scenes/LobbyScene');
const StoryScene = require('./src/scenes/StoryScene');
const KitchenScene = require('./src/scenes/KitchenScene');
const StorageScene = require('./src/scenes/StorageScene');
const RoomAScene = require('./src/scenes/RoomAScene');
const RoomBScene = require('./src/scenes/RoomBScene');

// 初始化遊戲狀態（包含所有管理器）
console.log('🏮 初始化遊戲狀態...');
const gameState = new GameState();

// Phaser 3 遊戲配置
const config = {
    type: Phaser.AUTO,
    width: 1920,   // 標準遊戲解析度 (16:9)
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#2e2e2e',  // 深灰色背景

    // 音頻配置 - 修復長時間播放降速問題
    // 使用 HTML5 Audio 代替 Web Audio API（更穩定，特別是長時間循環播放）
    audio: {
        disableWebAudio: true,  // 禁用 Web Audio，改用 HTML5 Audio
        noAudio: false
    },

    // 物理引擎配置
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    // 場景列表（第一個場景會自動啟動）
    scene: [
        BootScene,      // 資源預載場景
        SplashScene,    // 啟動畫面場景（影片動畫）
        MainMenuScene,  // 主選單場景
        StoryScene,     // 視覺小說場景
        ExteriorScene,  // 客棧外觀場景
        LobbyScene,     // 客棧大廳場景
        KitchenScene,   // 廚房場景
        StorageScene,   // 儲藏室場景
        RoomAScene,     // 客房A場景
        RoomBScene      // 客房B場景
    ],

    // 渲染配置
    render: {
        antialias: true,
        roundPixels: true,
        pixelArt: false
    },

    // 縮放模式 - 響應式設計
    scale: {
        mode: Phaser.Scale.FIT,  // 適應視窗大小保持比例
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    }
};

// 創建遊戲實例
console.log('🎮 啟動 Phaser 引擎...');
const game = new Phaser.Game(config);

// 初始化 AudioManager（需要在 Phaser 遊戲實例創建後）
console.log('🔊 初始化音頻系統...');
const AudioManager = require('./src/managers/AudioManager');
gameState.audioManager = new AudioManager(game, gameState.settingsManager);

// 傳遞遊戲狀態和管理器到場景 registry（所有場景都可以訪問）
game.registry.set('gameState', gameState);
game.registry.set('timeManager', gameState.timeManager);
game.registry.set('audioManager', gameState.audioManager);
game.registry.set('saveManager', gameState.saveManager);

console.log('✅ Registry 設定完成');
console.log('   - gameState:', !!gameState);
console.log('   - timeManager:', !!gameState.timeManager);
console.log('   - audioManager:', !!gameState.audioManager);

// 第一個場景（BootScene）會自動啟動
// BootScene → SplashScene → MainMenuScene
console.log('🎬 準備啟動 BootScene...');

// 等待遊戲完全啟動後輸出資訊
game.events.once('ready', () => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🏮 悅來客棧 v0.2.0 - 已啟動');
    console.log('═══════════════════════════════════════');
    console.log(`渲染器: ${game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'}`);
    console.log(`解析度: ${config.width}×${config.height} (16:9)`);
    console.log(`初始時間: ${gameState.timeManager.getTimeDescription()}`);
    console.log('');
    console.log('💡 遊戲提示:');
    console.log('  - 點擊場景進行客棧管理');
    console.log('  - F11 切換全螢幕');
    console.log('  - 使用瀏覽器開發者工具 (F12) 查看詳細日誌');
    console.log('');
    console.log('🔧 開發者命令:');
    console.log('  window.innGame.setResolution("1920x1080") - 切換解析度');
    console.log('  window.innGame.toggleFullscreen() - 切換全螢幕');
    console.log('  window.innGame.gameState.settingsManager.getSummary() - 查看設定');
    console.log('═══════════════════════════════════════');
    console.log('');
});

// 監聽解析度變更事件（Electron IPC）
if (typeof require !== 'undefined') {
    try {
        const { ipcRenderer } = require('electron');

        // 監聽解析度變更
        ipcRenderer.on('resolution-changed', (event, resolution, width, height) => {
            console.log(`📐 解析度已變更: ${resolution} (${width}×${height})`);

            // 更新 Phaser 遊戲尺寸
            game.scale.resize(width, height);

            // 更新設定管理器中的解析度（如果存在）
            if (gameState.settingsManager) {
                gameState.settingsManager.settings.display.resolution = resolution;
            }
        });

        // 監聽全螢幕變更
        ipcRenderer.on('fullscreen-changed', (event, isFullScreen) => {
            console.log(`🖥️ 全螢幕模式: ${isFullScreen ? '開啟' : '關閉'}`);

            // 更新設定管理器中的全螢幕狀態（如果存在）
            if (gameState.settingsManager) {
                gameState.settingsManager.settings.display.fullscreen = isFullScreen;
            }
        });
    } catch (error) {
        console.log('💻 瀏覽器模式：Electron IPC 不可用');
    }
}

// 全局遊戲狀態（供調試使用）
window.innGame = {
    game: game,
    gameState: gameState,
    timeManager: gameState.timeManager,
    version: '0.2.0',

    // 便捷方法：切換解析度
    setResolution: function(resolution) {
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('set-resolution', resolution);
                console.log(`✅ 正在切換解析度至: ${resolution}`);
            } catch (error) {
                console.log('⚠️ 瀏覽器模式不支援動態解析度切換');
            }
        }
    },

    // 便捷方法：切換全螢幕
    toggleFullscreen: function() {
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('toggle-fullscreen');
                console.log('✅ 切換全螢幕模式');
            } catch (error) {
                console.log('⚠️ 瀏覽器模式請使用 F11 切換全螢幕');
            }
        }
    },

    // 便捷方法：設定全螢幕
    setFullscreen: function(fullscreen) {
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('set-fullscreen', fullscreen);
                console.log(`✅ 設定全螢幕: ${fullscreen ? '開啟' : '關閉'}`);
            } catch (error) {
                console.log('⚠️ 瀏覽器模式請使用 F11 切換全螢幕');
            }
        }
    }
};

// Phaser Scale Manager 會自動處理視窗大小變化
// 使用 scale.mode = Phaser.Scale.FIT 來保持遊戲比例

// 錯誤處理
window.addEventListener('error', (event) => {
    console.error('❌ 遊戲錯誤:', event.error);
});

// 退出前存檔
window.addEventListener('beforeunload', () => {
    gameState.save();
    console.log('💾 退出前存檔完成');
});

// 開發模式調試工具
if (process.env.NODE_ENV === 'development' || process.argv.includes('--watch')) {
    console.log('🔧 開發模式已啟用');
    console.log('');
    console.log('調試命令:');
    console.log('  window.innGame.gameState - 查看遊戲狀態');
    console.log('  window.innGame.timeManager - 查看時間系統');
    console.log('  window.innGame.gameState.timeManager.getSummary() - 時間摘要');
    console.log('  window.innGame.gameState.timeManager.speedUp(10) - 加速時間');
    console.log('  window.innGame.gameState.addSilver(1000) - 增加銀兩');
    console.log('');
}
