// 導入場景
const DesktopScene = require('./src/scenes/DesktopScene');

// Phaser 3 遊戲配置 - 桌面版本
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
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
        DesktopScene  // 桌面主場景
    ],

    // 渲染配置
    render: {
        transparent: true,  // 啟用透明渲染
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

// 全局遊戲狀態
window.desktopRPG = {
    game: game,
    version: '2.0.0',
    settings: {
        volume: 1.0,
        language: 'zh-TW',
        autoSave: true
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

console.log('桌面冒險者 v2.0 已初始化');
console.log('Renderer:', game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas');
console.log('透明視窗已啟用');
