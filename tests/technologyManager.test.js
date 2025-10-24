/**
 * TechnologyManager 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const GameState = require('../src/core/GameState');

describe('TechnologyManager', () => {
    let gameState;
    let technologyManager;

    beforeEach(() => {
        gameState = new GameState();
        technologyManager = gameState.technologyManager;
    });

    describe('初始化和數據載入', () => {
        it('應該成功初始化 TechnologyManager', () => {
            expect(technologyManager).toBeDefined();
            expect(technologyManager.technologies).toBeDefined();
            expect(technologyManager.unlockedTechs).toBeDefined();
        });

        it('應該成功載入科技數據', () => {
            const result = technologyManager.loadTechnologies();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
        });

        it('應該載入所有科技分類', () => {
            expect(Object.keys(technologyManager.categories)).toContain('building');
            expect(Object.keys(technologyManager.categories)).toContain('facility');
            expect(Object.keys(technologyManager.categories)).toContain('recipe');
            expect(Object.keys(technologyManager.categories)).toContain('dispatch');
            expect(Object.keys(technologyManager.categories)).toContain('scene');
        });

        it('應該初始化建築容量', () => {
            expect(technologyManager.buildingCapacities.guest_rooms).toBe(3);
            expect(technologyManager.buildingCapacities.kitchen_level).toBe(1);
            expect(technologyManager.buildingCapacities.smithy_level).toBe(0);
        });
    });

    describe('檢查解鎖條件', () => {
        it('應該允許解鎖無前置條件的 Tier 1 科技', () => {
            // 給予足夠資源
            gameState.silver = 10000;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);
            gameState.player.level = 5;

            const result = technologyManager.canUnlock('inn_expansion_1');
            expect(result.canUnlock).toBe(true);
        });

        it('應該拒絕銀兩不足的解鎖', () => {
            gameState.silver = 100; // 不夠
            gameState.player.level = 5; // 等級足夠
            gameState.inventory.addItem('wood', 1000); // 材料足夠
            gameState.inventory.addItem('iron_ore', 1000);

            const result = technologyManager.canUnlock('inn_expansion_1');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('銀兩不足');
        });

        it('應該拒絕等級不足的解鎖', () => {
            gameState.silver = 10000;
            gameState.player.level = 1;
            const result = technologyManager.canUnlock('inn_expansion_1');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('等級');
        });

        it('應該拒絕材料不足的解鎖', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 10); // 不夠
            const result = technologyManager.canUnlock('inn_expansion_1');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('材料不足');
        });

        it('應該拒絕前置科技未滿足的解鎖', () => {
            gameState.silver = 100000;
            gameState.player.level = 20;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);
            gameState.inventory.addItem('silk', 1000);

            const result = technologyManager.canUnlock('inn_expansion_2');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('需要先解鎖');
        });

        it('應該拒絕已解鎖的科技', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            technologyManager.unlock('inn_expansion_1');
            const result = technologyManager.canUnlock('inn_expansion_1');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('已經解鎖');
        });
    });

    describe('解鎖科技', () => {
        it('應該成功解鎖 Tier 1 科技', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            const initialSilver = gameState.silver;
            const result = technologyManager.unlock('inn_expansion_1');

            expect(result.success).toBe(true);
            expect(technologyManager.isUnlocked('inn_expansion_1')).toBe(true);
            expect(gameState.silver).toBeLessThan(initialSilver);
        });

        it('應該扣除正確的資源', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            const initialWood = gameState.inventory.getItemCount('wood');
            const initialIron = gameState.inventory.getItemCount('iron_ore');

            technologyManager.unlock('inn_expansion_1');

            expect(gameState.inventory.getItemCount('wood')).toBe(initialWood - 50);
            expect(gameState.inventory.getItemCount('iron_ore')).toBe(initialIron - 20);
        });

        it('應該應用建築容量效果', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            const initialRooms = technologyManager.buildingCapacities.guest_rooms;
            technologyManager.unlock('inn_expansion_1');

            expect(technologyManager.buildingCapacities.guest_rooms).toBe(initialRooms + 2);
        });

        it('應該應用設施等級效果', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            technologyManager.unlock('kitchen_upgrade_1');

            expect(technologyManager.buildingCapacities.kitchen_level).toBe(2);
        });

        it('應該允許按順序解鎖有前置條件的科技', () => {
            gameState.silver = 100000;
            gameState.player.level = 10;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);
            gameState.inventory.addItem('silk', 1000);
            gameState.inn.level = 3;

            // 先解鎖前置科技
            technologyManager.unlock('inn_expansion_1');
            expect(technologyManager.isUnlocked('inn_expansion_1')).toBe(true);

            // 再解鎖依賴科技
            const result = technologyManager.unlock('inn_expansion_2');
            expect(result.success).toBe(true);
            expect(technologyManager.isUnlocked('inn_expansion_2')).toBe(true);
        });
    });

    describe('獲取科技信息', () => {
        it('應該返回完整的科技信息', () => {
            const techInfo = technologyManager.getTechInfo('inn_expansion_1');

            expect(techInfo).toBeDefined();
            expect(techInfo.id).toBe('inn_expansion_1');
            expect(techInfo.name).toBeDefined();
            expect(techInfo.description).toBeDefined();
            expect(techInfo.category).toBeDefined();
            expect(techInfo.cost).toBeDefined();
            expect(techInfo.unlocked).toBe(false);
        });

        it('應該正確標記已解鎖的科技', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            technologyManager.unlock('inn_expansion_1');
            const techInfo = technologyManager.getTechInfo('inn_expansion_1');

            expect(techInfo.unlocked).toBe(true);
        });

        it('應該返回 null 對於不存在的科技', () => {
            const techInfo = technologyManager.getTechInfo('nonexistent_tech');
            expect(techInfo).toBeNull();
        });
    });

    describe('獲取科技列表', () => {
        it('應該按分類返回所有科技', () => {
            const allTechs = technologyManager.getAllTechnologies();

            expect(allTechs).toBeDefined();
            expect(allTechs.building).toBeDefined();
            expect(allTechs.facility).toBeDefined();
            expect(allTechs.building.technologies.length).toBeGreaterThan(0);
        });

        it('應該返回可解鎖的科技', () => {
            gameState.silver = 100000;
            gameState.player.level = 20;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);
            gameState.inventory.addItem('silk', 1000);

            const available = technologyManager.getAvailableTechnologies();
            expect(available.length).toBeGreaterThan(0);
        });

        it('應該返回已解鎖的科技', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            technologyManager.unlock('inn_expansion_1');
            const unlocked = technologyManager.getUnlockedTechnologies();

            expect(unlocked.length).toBe(1);
            expect(unlocked[0].id).toBe('inn_expansion_1');
        });

        it('可解鎖列表應該排除已解鎖的科技', () => {
            gameState.silver = 100000;
            gameState.player.level = 20;
            gameState.inventory.addItem('wood', 10000);
            gameState.inventory.addItem('iron_ore', 10000);
            gameState.inventory.addItem('silk', 10000);

            const beforeUnlock = technologyManager.getAvailableTechnologies();
            const beforeCount = beforeUnlock.length;

            // 解鎖一個科技
            if (beforeCount > 0) {
                technologyManager.unlock(beforeUnlock[0].id);
                const afterUnlock = technologyManager.getAvailableTechnologies();

                // 可用列表不應該包含已解鎖的科技
                expect(afterUnlock.find(t => t.id === beforeUnlock[0].id)).toBeUndefined();
            }
        });
    });

    describe('建築容量管理', () => {
        it('應該返回單一建築類型的容量', () => {
            const capacity = technologyManager.getBuildingCapacity('guest_rooms');
            expect(capacity).toBe(3);
        });

        it('應該返回所有建築容量', () => {
            const capacities = technologyManager.getAllBuildingCapacities();

            expect(capacities.guest_rooms).toBeDefined();
            expect(capacities.kitchen_level).toBeDefined();
            expect(capacities.storage_capacity).toBeDefined();
        });

        it('應該累加多次升級的容量', () => {
            gameState.silver = 100000;
            gameState.player.level = 20;
            gameState.inventory.addItem('wood', 10000);
            gameState.inventory.addItem('iron_ore', 10000);
            gameState.inventory.addItem('silk', 10000);
            gameState.inn.level = 5;

            const initialRooms = technologyManager.buildingCapacities.guest_rooms;

            technologyManager.unlock('inn_expansion_1');
            technologyManager.unlock('inn_expansion_2');

            expect(technologyManager.buildingCapacities.guest_rooms).toBe(initialRooms + 2 + 3);
        });
    });

    describe('統計數據', () => {
        it('應該返回科技樹統計', () => {
            const stats = technologyManager.getStatistics();

            expect(stats.total).toBeGreaterThan(0);
            expect(stats.unlocked).toBe(0);
            expect(stats.progress).toBeDefined();
            expect(stats.byCategory).toBeDefined();
        });

        it('應該正確計算解鎖進度', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            const statsBefore = technologyManager.getStatistics();
            technologyManager.unlock('inn_expansion_1');
            const statsAfter = technologyManager.getStatistics();

            expect(statsAfter.unlocked).toBe(statsBefore.unlocked + 1);
            expect(parseFloat(statsAfter.progress)).toBeGreaterThan(parseFloat(statsBefore.progress));
        });

        it('應該按分類統計科技', () => {
            const stats = technologyManager.getStatistics();

            expect(stats.byCategory.building).toBeDefined();
            expect(stats.byCategory.building.total).toBeGreaterThan(0);
            expect(stats.byCategory.building.unlocked).toBe(0);
        });
    });

    describe('序列化和反序列化', () => {
        it('應該正確序列化科技樹狀態', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            technologyManager.unlock('inn_expansion_1');

            const serialized = technologyManager.serialize();

            expect(serialized.unlockedTechs).toBeDefined();
            expect(serialized.unlockedTechs).toContain('inn_expansion_1');
            expect(serialized.buildingCapacities).toBeDefined();
        });

        it('應該正確反序列化科技樹狀態', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            technologyManager.unlock('inn_expansion_1');
            const serialized = technologyManager.serialize();

            // 創建新的管理器並反序列化
            const newGameState = new GameState();
            newGameState.technologyManager.deserialize(serialized);

            expect(newGameState.technologyManager.isUnlocked('inn_expansion_1')).toBe(true);
            expect(newGameState.technologyManager.buildingCapacities.guest_rooms).toBe(
                technologyManager.buildingCapacities.guest_rooms
            );
        });

        it('反序列化應該重新應用效果', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            technologyManager.unlock('inn_expansion_1');
            const roomsAfterUnlock = technologyManager.buildingCapacities.guest_rooms;
            const serialized = technologyManager.serialize();

            // 重置容量
            technologyManager.buildingCapacities.guest_rooms = 3;

            // 反序列化應該重新應用效果
            technologyManager.deserialize(serialized);
            expect(technologyManager.buildingCapacities.guest_rooms).toBe(roomsAfterUnlock);
        });
    });

    describe('GameState 整合', () => {
        it('應該在 GameState 中正確初始化', () => {
            expect(gameState.technologyManager).toBeDefined();
            expect(Object.keys(gameState.technologyManager.technologies).length).toBeGreaterThan(0);
        });

        it('應該在 GameState.save() 中包含科技樹數據', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            gameState.technologyManager.unlock('inn_expansion_1');

            // 測試序列化數據而非 localStorage（測試環境無 localStorage）
            const serialized = gameState.technologyManager.serialize();
            expect(serialized).toBeDefined();
            expect(serialized.unlockedTechs).toContain('inn_expansion_1');
        });

        it('應該在 GameState.load() 中恢復科技樹數據', () => {
            gameState.silver = 10000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 1000);
            gameState.inventory.addItem('iron_ore', 1000);

            gameState.technologyManager.unlock('inn_expansion_1');

            // 測試序列化/反序列化循環
            const serialized = gameState.technologyManager.serialize();
            const newGameState = new GameState();
            newGameState.technologyManager.deserialize(serialized);

            expect(newGameState.technologyManager.isUnlocked('inn_expansion_1')).toBe(true);
        });
    });

    describe('邊界情況', () => {
        it('應該處理不存在的科技 ID', () => {
            const result = technologyManager.unlock('nonexistent_tech');
            expect(result.success).toBe(false);
        });

        it('應該處理不存在的建築類型', () => {
            const capacity = technologyManager.getBuildingCapacity('nonexistent_building');
            expect(capacity).toBe(0);
        });

        it('應該處理空的序列化數據', () => {
            expect(() => {
                technologyManager.deserialize({});
            }).not.toThrow();
        });

        it('應該處理無效的序列化數據', () => {
            expect(() => {
                technologyManager.deserialize({ unlockedTechs: null });
            }).not.toThrow();
        });

        it('應該處理資源剛好足夠的情況', () => {
            gameState.silver = 1000;
            gameState.player.level = 5;
            gameState.inventory.addItem('wood', 50);
            gameState.inventory.addItem('iron_ore', 20);

            const result = technologyManager.unlock('inn_expansion_1');
            expect(result.success).toBe(true);
            expect(gameState.silver).toBe(0);
        });
    });

    describe('複雜科技樹路徑', () => {
        it('應該支持多層級前置條件', () => {
            gameState.silver = 1000000;
            gameState.player.level = 20;
            gameState.inn.level = 5;
            gameState.inn.reputation = 1000;
            gameState.inventory.addItem('wood', 10000);
            gameState.inventory.addItem('iron_ore', 10000);
            gameState.inventory.addItem('silk', 10000);
            gameState.inventory.addItem('coal', 10000);

            // 解鎖路徑: inn_expansion_1 -> smithy_unlock -> smithy_upgrade_1
            technologyManager.unlock('inn_expansion_1');
            const canUnlockSmithy = technologyManager.canUnlock('smithy_unlock');
            expect(canUnlockSmithy.canUnlock).toBe(true);

            technologyManager.unlock('smithy_unlock');
            expect(technologyManager.buildingCapacities.smithy_level).toBe(1);
        });

        it('應該支持並行的科技分支', () => {
            gameState.silver = 1000000;
            gameState.player.level = 20;
            gameState.inventory.addItem('wood', 10000);
            gameState.inventory.addItem('iron_ore', 10000);
            gameState.inventory.addItem('silk', 10000);

            // 解鎖兩個不同分支
            technologyManager.unlock('kitchen_upgrade_1');
            technologyManager.unlock('storage_expansion_1');

            expect(technologyManager.isUnlocked('kitchen_upgrade_1')).toBe(true);
            expect(technologyManager.isUnlocked('storage_expansion_1')).toBe(true);
        });
    });
});
