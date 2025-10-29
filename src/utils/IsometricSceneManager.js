/**
 * IsometricSceneManager - 2.5D 等角視圖場景管理器
 *
 * 提供以下功能：
 * 1. 深度排序（Z-ordering）
 * 2. 可行走區域管理
 * 3. 點擊移動系統
 * 4. 碰撞檢測
 * 5. 角色管理
 */

class IsometricSceneManager {
    /**
     * @param {Phaser.Scene} scene - Phaser 場景實例
     */
    constructor(scene) {
        this.scene = scene;
        this.characters = [];
        this.walkableArea = null;
        this.obstacles = [];
        this.interactiveObjects = [];
        this.debugMode = false;
        this.debugGraphics = null;
    }

    /**
     * 設定可行走區域（多邊形）
     * @param {Array} points - 多邊形頂點陣列 [{x, y}, ...]
     */
    setWalkableArea(points) {
        this.walkableArea = new Phaser.Geom.Polygon(points);

        // 如果是調試模式，繪製可行走區域
        if (this.debugMode) {
            this.drawWalkableAreaDebug();
        }
    }

    /**
     * 添加障礙物
     * @param {Object} obstacle - 障礙物配置 {x, y, width, height, name}
     */
    addObstacle(obstacle) {
        this.obstacles.push({
            rect: new Phaser.Geom.Rectangle(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            ),
            name: obstacle.name || 'obstacle'
        });

        // 如果是調試模式，繪製障礙物
        if (this.debugMode) {
            this.drawObstaclesDebug();
        }
    }

    /**
     * 添加可互動物件
     * @param {Object} config - {x, y, radius, name, action}
     */
    addInteractiveObject(config) {
        this.interactiveObjects.push({
            x: config.x,
            y: config.y,
            radius: config.radius || 50,
            name: config.name,
            action: config.action
        });
    }

    /**
     * 註冊角色（用於深度排序）
     * @param {Phaser.GameObjects.Sprite} sprite - 角色 sprite
     * @param {number} speed - 移動速度（像素/秒）
     */
    registerCharacter(sprite, speed = 200) {
        sprite.speed = speed;
        this.characters.push(sprite);

        // 初始化深度
        sprite.depth = sprite.y;
    }

    /**
     * 檢查座標是否可行走
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isWalkable(x, y) {
        // 檢查是否在可行走區域內
        if (this.walkableArea) {
            if (!Phaser.Geom.Polygon.Contains(this.walkableArea, x, y)) {
                return false;
            }
        }

        // 檢查是否碰到障礙物
        for (const obstacle of this.obstacles) {
            if (Phaser.Geom.Rectangle.Contains(obstacle.rect, x, y)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 移動角色到指定位置
     * @param {Phaser.GameObjects.Sprite} character - 角色 sprite
     * @param {number} targetX - 目標 X 座標
     * @param {number} targetY - 目標 Y 座標
     * @param {Object} options - 選項 {onStart, onUpdate, onComplete}
     */
    moveCharacterTo(character, targetX, targetY, options = {}) {
        // 檢查目標位置是否可行走
        if (!this.isWalkable(targetX, targetY)) {
            console.log('目標位置不可行走');
            return false;
        }

        // 停止當前移動
        this.scene.tweens.killTweensOf(character);

        // 計算距離和移動時間
        const distance = Phaser.Math.Distance.Between(
            character.x,
            character.y,
            targetX,
            targetY
        );
        const duration = (distance / character.speed) * 1000;

        // 創建移動動畫
        this.scene.tweens.add({
            targets: character,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Linear',
            onStart: () => {
                // 播放行走動畫（如果存在）
                if (character.anims && character.anims.exists('walk')) {
                    character.play('walk', true);
                }

                if (options.onStart) {
                    options.onStart(character);
                }
            },
            onUpdate: () => {
                // 更新深度
                character.depth = character.y;

                if (options.onUpdate) {
                    options.onUpdate(character);
                }
            },
            onComplete: () => {
                // 播放閒置動畫（如果存在）
                if (character.anims && character.anims.exists('idle')) {
                    character.play('idle', true);
                }

                if (options.onComplete) {
                    options.onComplete(character);
                }
            }
        });

        return true;
    }

    /**
     * 啟用點擊移動功能
     * @param {Phaser.GameObjects.Sprite} playerCharacter - 玩家角色
     * @param {Object} options - 選項
     */
    enableClickToMove(playerCharacter, options = {}) {
        this.scene.input.on('pointerdown', (pointer) => {
            const x = pointer.x;
            const y = pointer.y;

            // 檢查是否點擊到互動物件
            const interactiveObj = this.getInteractiveObjectAt(x, y);
            if (interactiveObj) {
                // 執行互動物件的動作
                if (interactiveObj.action) {
                    interactiveObj.action();
                }
                return;
            }

            // 移動到點擊位置
            this.moveCharacterTo(playerCharacter, x, y, options);
        });
    }

    /**
     * 獲取指定位置的互動物件
     * @param {number} x
     * @param {number} y
     * @returns {Object|null}
     */
    getInteractiveObjectAt(x, y) {
        for (const obj of this.interactiveObjects) {
            const distance = Phaser.Math.Distance.Between(x, y, obj.x, obj.y);
            if (distance <= obj.radius) {
                return obj;
            }
        }
        return null;
    }

    /**
     * 更新所有角色的深度排序（每幀調用）
     */
    updateDepthSorting() {
        this.characters.forEach(character => {
            // 根據 Y 座標設定深度
            // 加上微小的 X 偏移避免相同 Y 時的閃爍
            character.depth = character.y + (character.x * 0.0001);
        });
    }

    /**
     * 檢查兩個角色是否碰撞
     * @param {Phaser.GameObjects.Sprite} sprite1
     * @param {Phaser.GameObjects.Sprite} sprite2
     * @param {number} radius - 碰撞半徑
     * @returns {boolean}
     */
    checkCollision(sprite1, sprite2, radius = 40) {
        const distance = Phaser.Math.Distance.Between(
            sprite1.x,
            sprite1.y,
            sprite2.x,
            sprite2.y
        );
        return distance < radius;
    }

    /**
     * 切換調試模式
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;

        if (this.debugMode) {
            this.showDebug();
        } else {
            this.hideDebug();
        }
    }

    /**
     * 顯示調試資訊
     */
    showDebug() {
        this.drawWalkableAreaDebug();
        this.drawObstaclesDebug();
        this.drawInteractiveObjectsDebug();
    }

    /**
     * 隱藏調試資訊
     */
    hideDebug() {
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
            this.debugGraphics = null;
        }
    }

    /**
     * 繪製可行走區域（調試用）
     */
    drawWalkableAreaDebug() {
        if (!this.debugGraphics) {
            this.debugGraphics = this.scene.add.graphics();
            this.debugGraphics.setDepth(999);
        }

        if (this.walkableArea) {
            this.debugGraphics.lineStyle(2, 0x00ff00, 0.8);
            this.debugGraphics.strokePoints(this.walkableArea.points, true);
            this.debugGraphics.fillStyle(0x00ff00, 0.1);
            this.debugGraphics.fillPoints(this.walkableArea.points, true);
        }
    }

    /**
     * 繪製障礙物（調試用）
     */
    drawObstaclesDebug() {
        if (!this.debugGraphics) {
            this.debugGraphics = this.scene.add.graphics();
            this.debugGraphics.setDepth(999);
        }

        this.obstacles.forEach(obstacle => {
            this.debugGraphics.lineStyle(2, 0xff0000, 0.8);
            this.debugGraphics.strokeRect(
                obstacle.rect.x,
                obstacle.rect.y,
                obstacle.rect.width,
                obstacle.rect.height
            );
            this.debugGraphics.fillStyle(0xff0000, 0.2);
            this.debugGraphics.fillRect(
                obstacle.rect.x,
                obstacle.rect.y,
                obstacle.rect.width,
                obstacle.rect.height
            );
        });
    }

    /**
     * 繪製互動物件（調試用）
     */
    drawInteractiveObjectsDebug() {
        if (!this.debugGraphics) {
            this.debugGraphics = this.scene.add.graphics();
            this.debugGraphics.setDepth(999);
        }

        this.interactiveObjects.forEach(obj => {
            this.debugGraphics.lineStyle(2, 0x0000ff, 0.8);
            this.debugGraphics.strokeCircle(obj.x, obj.y, obj.radius);
            this.debugGraphics.fillStyle(0x0000ff, 0.1);
            this.debugGraphics.fillCircle(obj.x, obj.y, obj.radius);
        });
    }

    /**
     * 從 JSON 配置載入場景設定
     * @param {Object} config - 場景配置
     */
    loadFromConfig(config) {
        // 設定可行走區域
        if (config.walkableArea && config.walkableArea.points) {
            this.setWalkableArea(config.walkableArea.points);
        }

        // 添加障礙物
        if (config.obstacles) {
            config.obstacles.forEach(obstacle => {
                this.addObstacle(obstacle);
            });
        }

        // 添加互動物件
        if (config.interactiveObjects) {
            config.interactiveObjects.forEach(obj => {
                this.addInteractiveObject(obj);
            });
        }
    }

    /**
     * 清理資源
     */
    destroy() {
        this.characters = [];
        this.obstacles = [];
        this.interactiveObjects = [];

        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }

        this.scene.input.off('pointerdown');
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IsometricSceneManager;
}
