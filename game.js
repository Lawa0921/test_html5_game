// 導入場景
const BootScene = require('./src/scenes/BootScene');
const MainGameScene = require('./src/scenes/MainGameScene');

// Phaser 3 遊戲配置
const config = {
    type: Phaser.AUTO,  // 自動選擇 WebGL 或 Canvas
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',

    // 物理引擎配置（Arcade Physics - 輕量級）
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false  // 開發時可設為 true
        }
    },

    // 場景列表
    scene: [
        BootScene,       // 啟動場景（載入資源）
        MainGameScene    // 主遊戲場景（桌面掛機養成）
    ],

    // 渲染配置
    render: {
        pixelArt: false,  // 如果是像素風遊戲設為 true
        antialias: true,
        roundPixels: true
    },

    // 縮放模式
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 創建遊戲實例
const game = new Phaser.Game(config);

// 全局遊戲狀態（如果需要）
window.gameState = {
    currentScene: null,
    player: null,
    settings: {
        volume: 1.0,
        language: 'zh-TW'
    }
};

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
    console.error('Game error:', event.error);
});

console.log('Phaser game initialized');
console.log('Renderer:', game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas');
