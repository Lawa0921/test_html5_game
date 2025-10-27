/**
 * SceneManager - 場景管理器
 *
 * 統一管理場景切換邏輯，確保 gameState 和 timeManager 正確傳遞
 */

class SceneManager {
    constructor(scene, gameState, timeManager) {
        this.scene = scene;
        this.gameState = gameState;
        this.timeManager = timeManager;

        // 場景配置
        this.sceneConfig = {
            'ExteriorScene': {
                windowSize: 'small',
                width: 300,
                height: 400,
                name: '客棧外觀'
            },
            'LobbyScene': {
                windowSize: 'large',
                width: 900,
                height: 650,
                name: '客棧大廳'
            },
            'KitchenScene': {
                windowSize: 'large',
                width: 900,
                height: 650,
                name: '廚房'
            },
            'StorageScene': {
                windowSize: 'large',
                width: 900,
                height: 650,
                name: '儲藏室'
            },
            'RoomAScene': {
                windowSize: 'large',
                width: 900,
                height: 650,
                name: '客房A'
            },
            'RoomBScene': {
                windowSize: 'large',
                width: 900,
                height: 650,
                name: '客房B'
            },
            'StoryScene': {
                windowSize: 'story',
                width: 1600,
                height: 900,
                name: '視覺小說'
            }
        };
    }

    /**
     * 切換到指定場景
     * @param {string} sceneName - 場景名稱（如 'LobbyScene'）
     * @param {Object} extraData - 額外的場景數據
     */
    switchTo(sceneName, extraData = {}) {
        const config = this.sceneConfig[sceneName];

        if (!config) {
            console.warn(`場景 ${sceneName} 不存在於配置中`);
            return;
        }

        console.log(`🎬 場景切換: ${config.name} (${sceneName})`);

        // 通知 Electron 調整視窗大小
        if (config.windowSize && typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('toggle-window-size', config.windowSize);
            } catch (e) {
                console.log('非 Electron 環境，跳過視窗調整');
            }
        }

        // 淡出效果
        this.scene.cameras.main.fadeOut(300, 0, 0, 0);

        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            // 準備場景數據
            const sceneData = {
                gameState: this.gameState,
                timeManager: this.timeManager,
                ...extraData
            };

            // 啟動新場景
            this.scene.scene.start(sceneName, sceneData);
        });
    }

    /**
     * 切換到外部場景（桌面寵物模式）
     */
    toExterior(extraData = {}) {
        this.switchTo('ExteriorScene', extraData);
    }

    /**
     * 切換到大廳場景
     */
    toLobby(extraData = {}) {
        this.switchTo('LobbyScene', extraData);
    }

    /**
     * 切換到廚房場景
     */
    toKitchen(extraData = {}) {
        this.switchTo('KitchenScene', extraData);
    }

    /**
     * 切換到儲藏室場景
     */
    toStorage(extraData = {}) {
        this.switchTo('StorageScene', extraData);
    }

    /**
     * 切換到客房A
     */
    toRoomA(extraData = {}) {
        this.switchTo('RoomAScene', extraData);
    }

    /**
     * 切換到客房B
     */
    toRoomB(extraData = {}) {
        this.switchTo('RoomBScene', extraData);
    }

    /**
     * 切換到視覺小說場景
     */
    toStory(storyId, extraData = {}) {
        this.switchTo('StoryScene', {
            storyId,
            ...extraData
        });
    }

    /**
     * 獲取當前場景配置
     */
    getCurrentConfig() {
        const currentKey = this.scene.scene.key;
        return this.sceneConfig[currentKey];
    }

    /**
     * 檢查場景是否存在
     */
    hasScene(sceneName) {
        return sceneName in this.sceneConfig;
    }
}

module.exports = SceneManager;
