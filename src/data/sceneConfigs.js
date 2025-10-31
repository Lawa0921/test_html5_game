/**
 * 場景配置數據
 *
 * 為每個場景定義：
 * - 可行走區域
 * - 障礙物
 * - 互動物件
 * - 角色出生點
 */

const SCENE_CONFIGS = {
    /**
     * 大廳場景配置
     */
    LobbyScene: {
        walkableArea: {
            type: 'polygon',
            points: [
                { x: 150, y: 250 },   // 左上角
                { x: 1130, y: 250 },  // 右上角
                { x: 1050, y: 580 },  // 右下角
                { x: 230, y: 580 }    // 左下角
            ]
        },
        obstacles: [
            {
                x: 400,
                y: 350,
                width: 120,
                height: 80,
                name: '圓桌'
            },
            {
                x: 700,
                y: 350,
                width: 120,
                height: 80,
                name: '方桌'
            },
            {
                x: 520,
                y: 200,
                width: 240,
                height: 60,
                name: '櫃台'
            }
        ],
        interactiveObjects: [
            {
                x: 640,
                y: 230,
                radius: 60,
                name: '櫃台',
                action: 'showCounterUI'
            },
            {
                x: 460,
                y: 390,
                radius: 50,
                name: '圓桌',
                action: 'showTableMenu'
            },
            {
                x: 760,
                y: 390,
                radius: 50,
                name: '方桌',
                action: 'showTableMenu'
            }
        ],
        spawnPoints: {
            player: { x: 640, y: 500 },
            npc1: { x: 300, y: 400 },
            npc2: { x: 900, y: 400 }
        }
    },

    /**
     * 廚房場景配置
     */
    KitchenScene: {
        walkableArea: {
            type: 'polygon',
            points: [
                { x: 200, y: 300 },
                { x: 1080, y: 300 },
                { x: 1000, y: 550 },
                { x: 280, y: 550 }
            ]
        },
        obstacles: [
            {
                x: 350,
                y: 320,
                width: 180,
                height: 100,
                name: '爐灶'
            },
            {
                x: 700,
                y: 320,
                width: 150,
                height: 80,
                name: '料理台'
            }
        ],
        interactiveObjects: [
            {
                x: 440,
                y: 370,
                radius: 60,
                name: '爐灶',
                action: 'showCookingUI'
            },
            {
                x: 775,
                y: 360,
                radius: 50,
                name: '料理台',
                action: 'showPrepUI'
            }
        ],
        spawnPoints: {
            player: { x: 640, y: 480 },
            chef: { x: 440, y: 420 }
        }
    },

    /**
     * 儲藏室場景配置
     */
    StorageScene: {
        walkableArea: {
            type: 'polygon',
            points: [
                { x: 250, y: 280 },
                { x: 1030, y: 280 },
                { x: 950, y: 560 },
                { x: 330, y: 560 }
            ]
        },
        obstacles: [
            {
                x: 300,
                y: 300,
                width: 100,
                height: 120,
                name: '木箱1'
            },
            {
                x: 450,
                y: 300,
                width: 100,
                height: 120,
                name: '木箱2'
            },
            {
                x: 750,
                y: 300,
                width: 200,
                height: 150,
                name: '貨架'
            }
        ],
        interactiveObjects: [
            {
                x: 350,
                y: 360,
                radius: 50,
                name: '食材箱',
                action: 'showFoodStorage'
            },
            {
                x: 500,
                y: 360,
                radius: 50,
                name: '酒水箱',
                action: 'showDrinkStorage'
            },
            {
                x: 850,
                y: 375,
                radius: 60,
                name: '貨架',
                action: 'showItemStorage'
            }
        ],
        spawnPoints: {
            player: { x: 640, y: 480 }
        }
    }
};

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SCENE_CONFIGS;
}
