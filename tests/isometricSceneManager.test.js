/**
 * IsometricSceneManager 測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Phaser
const mockScene = {
    add: {
        graphics: vi.fn(() => ({
            lineStyle: vi.fn(),
            strokePoints: vi.fn(),
            fillStyle: vi.fn(),
            fillPoints: vi.fn(),
            strokeRect: vi.fn(),
            fillRect: vi.fn(),
            strokeCircle: vi.fn(),
            fillCircle: vi.fn(),
            destroy: vi.fn(),
            setDepth: vi.fn()
        }))
    },
    tweens: {
        add: vi.fn(),
        killTweensOf: vi.fn()
    },
    input: {
        on: vi.fn(),
        off: vi.fn()
    }
};

// Mock Phaser.Geom
global.Phaser = {
    Geom: {
        Polygon: class {
            constructor(points) {
                this.points = points;
            }
            static Contains(polygon, x, y) {
                // 簡單的矩形檢測（實際 Phaser 會做更精確的多邊形檢測）
                if (polygon.points.length === 0) return false;

                let minX = Infinity, maxX = -Infinity;
                let minY = Infinity, maxY = -Infinity;

                polygon.points.forEach(p => {
                    minX = Math.min(minX, p.x);
                    maxX = Math.max(maxX, p.x);
                    minY = Math.min(minY, p.y);
                    maxY = Math.max(maxY, p.y);
                });

                return x >= minX && x <= maxX && y >= minY && y <= maxY;
            }
        },
        Rectangle: class {
            constructor(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }
            static Contains(rect, x, y) {
                return x >= rect.x &&
                       x <= rect.x + rect.width &&
                       y >= rect.y &&
                       y <= rect.y + rect.height;
            }
        }
    },
    Math: {
        Distance: {
            Between: (x1, y1, x2, y2) => {
                const dx = x2 - x1;
                const dy = y2 - y1;
                return Math.sqrt(dx * dx + dy * dy);
            }
        }
    }
};

const IsometricSceneManager = require('../src/utils/IsometricSceneManager');

describe('IsometricSceneManager', () => {
    let manager;

    beforeEach(() => {
        manager = new IsometricSceneManager(mockScene);
    });

    describe('初始化', () => {
        it('應該正確初始化', () => {
            expect(manager).toBeDefined();
            expect(manager.scene).toBe(mockScene);
            expect(manager.characters).toEqual([]);
            expect(manager.obstacles).toEqual([]);
            expect(manager.interactiveObjects).toEqual([]);
        });
    });

    describe('可行走區域', () => {
        it('應該能設定可行走區域', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ];

            manager.setWalkableArea(points);

            expect(manager.walkableArea).toBeDefined();
            expect(manager.walkableArea.points).toEqual(points);
        });

        it('應該正確檢測點是否在可行走區域內', () => {
            manager.setWalkableArea([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]);

            expect(manager.isWalkable(50, 50)).toBe(true);
            expect(manager.isWalkable(150, 150)).toBe(false);
        });

        it('沒有設定可行走區域時應該返回 true', () => {
            expect(manager.isWalkable(50, 50)).toBe(true);
        });
    });

    describe('障礙物', () => {
        it('應該能添加障礙物', () => {
            const obstacle = {
                x: 10,
                y: 10,
                width: 50,
                height: 50,
                name: '測試障礙物'
            };

            manager.addObstacle(obstacle);

            expect(manager.obstacles.length).toBe(1);
            expect(manager.obstacles[0].name).toBe('測試障礙物');
        });

        it('應該正確檢測障礙物碰撞', () => {
            manager.setWalkableArea([
                { x: 0, y: 0 },
                { x: 200, y: 0 },
                { x: 200, y: 200 },
                { x: 0, y: 200 }
            ]);

            manager.addObstacle({
                x: 50,
                y: 50,
                width: 50,
                height: 50,
                name: '障礙物'
            });

            expect(manager.isWalkable(75, 75)).toBe(false); // 在障礙物內
            expect(manager.isWalkable(25, 25)).toBe(true);  // 不在障礙物內
        });
    });

    describe('互動物件', () => {
        it('應該能添加互動物件', () => {
            const action = vi.fn();
            manager.addInteractiveObject({
                x: 100,
                y: 100,
                radius: 50,
                name: '測試物件',
                action: action
            });

            expect(manager.interactiveObjects.length).toBe(1);
            expect(manager.interactiveObjects[0].name).toBe('測試物件');
        });

        it('應該能獲取指定位置的互動物件', () => {
            const action = vi.fn();
            manager.addInteractiveObject({
                x: 100,
                y: 100,
                radius: 50,
                name: '測試物件',
                action: action
            });

            const obj = manager.getInteractiveObjectAt(110, 110);
            expect(obj).toBeDefined();
            expect(obj.name).toBe('測試物件');

            const noObj = manager.getInteractiveObjectAt(200, 200);
            expect(noObj).toBeNull();
        });
    });

    describe('角色管理', () => {
        it('應該能註冊角色', () => {
            const sprite = {
                x: 100,
                y: 100,
                depth: 0
            };

            manager.registerCharacter(sprite, 200);

            expect(manager.characters.length).toBe(1);
            expect(sprite.speed).toBe(200);
            expect(sprite.depth).toBe(100); // 深度應該等於 Y 座標
        });

        it('應該能更新深度排序', () => {
            const sprite1 = { x: 100, y: 100, depth: 0 };
            const sprite2 = { x: 200, y: 200, depth: 0 };

            manager.registerCharacter(sprite1);
            manager.registerCharacter(sprite2);

            // 移動角色
            sprite1.y = 300;

            manager.updateDepthSorting();

            expect(sprite1.depth).toBeGreaterThan(sprite2.depth);
        });
    });

    describe('角色移動', () => {
        it('應該能移動角色到可行走位置', () => {
            manager.setWalkableArea([
                { x: 0, y: 0 },
                { x: 200, y: 0 },
                { x: 200, y: 200 },
                { x: 0, y: 200 }
            ]);

            const sprite = {
                x: 50,
                y: 50,
                speed: 200,
                anims: null
            };

            manager.registerCharacter(sprite, 200);

            const result = manager.moveCharacterTo(sprite, 100, 100);

            expect(result).toBe(true);
            expect(mockScene.tweens.add).toHaveBeenCalled();
        });

        it('應該拒絕移動到不可行走位置', () => {
            manager.setWalkableArea([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ]);

            const sprite = {
                x: 50,
                y: 50,
                speed: 200
            };

            manager.registerCharacter(sprite);

            const result = manager.moveCharacterTo(sprite, 200, 200);

            expect(result).toBe(false);
        });
    });

    describe('碰撞檢測', () => {
        it('應該正確檢測角色碰撞', () => {
            const sprite1 = { x: 100, y: 100 };
            const sprite2 = { x: 120, y: 120 };
            const sprite3 = { x: 200, y: 200 };

            expect(manager.checkCollision(sprite1, sprite2, 40)).toBe(true);
            expect(manager.checkCollision(sprite1, sprite3, 40)).toBe(false);
        });
    });

    describe('配置載入', () => {
        it('應該能從配置載入場景', () => {
            const config = {
                walkableArea: {
                    points: [
                        { x: 0, y: 0 },
                        { x: 100, y: 0 },
                        { x: 100, y: 100 },
                        { x: 0, y: 100 }
                    ]
                },
                obstacles: [
                    {
                        x: 20,
                        y: 20,
                        width: 30,
                        height: 30,
                        name: '障礙物1'
                    }
                ],
                interactiveObjects: [
                    {
                        x: 50,
                        y: 50,
                        radius: 20,
                        name: '互動物件1',
                        action: vi.fn()
                    }
                ]
            };

            manager.loadFromConfig(config);

            expect(manager.walkableArea).toBeDefined();
            expect(manager.obstacles.length).toBe(1);
            expect(manager.interactiveObjects.length).toBe(1);
        });
    });

    describe('調試模式', () => {
        it('應該能切換調試模式', () => {
            expect(manager.debugMode).toBe(false);

            manager.toggleDebugMode();
            expect(manager.debugMode).toBe(true);

            manager.toggleDebugMode();
            expect(manager.debugMode).toBe(false);
        });

        it('調試模式下應該繪製可行走區域', () => {
            manager.setWalkableArea([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 }
            ]);

            manager.debugMode = true;
            manager.showDebug();

            expect(mockScene.add.graphics).toHaveBeenCalled();
        });
    });

    describe('清理', () => {
        it('應該能清理資源', () => {
            const sprite = { x: 100, y: 100, depth: 0 };
            manager.registerCharacter(sprite);
            manager.addObstacle({ x: 0, y: 0, width: 10, height: 10 });

            manager.destroy();

            expect(manager.characters.length).toBe(0);
            expect(manager.obstacles.length).toBe(0);
            expect(mockScene.input.off).toHaveBeenCalled();
        });
    });
});
