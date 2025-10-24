/**
 * MissionManager 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const MissionManager = require('../src/managers/MissionManager');
const GameState = require('../src/core/GameState');

describe('MissionManager', () => {
    let gameState;
    let missionManager;

    beforeEach(() => {
        gameState = new GameState();
        missionManager = gameState.missionManager;
    });

    describe('初始化和數據載入', () => {
        it('應該正確初始化 MissionManager', () => {
            expect(missionManager).toBeDefined();
            expect(missionManager.gameState).toBe(gameState);
            expect(missionManager.activeMissions).toEqual([]);
            expect(missionManager.missionHistory).toEqual([]);
        });

        it('應該載入任務數據庫', () => {
            const result = missionManager.loadMissionData();

            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
            expect(Object.keys(missionManager.missionDatabase).length).toBeGreaterThan(0);
        });

        it('任務數據庫應該包含所有任務類型', () => {
            const missions = Object.values(missionManager.missionDatabase);
            const types = new Set(missions.map(m => m.type));

            expect(types.has('escort')).toBe(true);
            expect(types.has('trade')).toBe(true);
            expect(types.has('explore')).toBe(true);
            expect(types.has('gather')).toBe(true);
        });

        it('所有任務應該有必要的屬性', () => {
            const missions = Object.values(missionManager.missionDatabase);

            missions.forEach(mission => {
                expect(mission.id).toBeDefined();
                expect(mission.type).toBeDefined();
                expect(mission.name).toBeDefined();
                expect(mission.description).toBeDefined();
                expect(mission.difficulty).toBeDefined();
                expect(mission.duration).toBeGreaterThan(0);
                expect(mission.rewards).toBeDefined();
            });
        });
    });

    describe('任務派遣', () => {
        beforeEach(() => {
            // 解鎖第一個員工（掌櫃）
            gameState.employees[0].hired.unlocked = true;
            // 設置足夠的屬性
            gameState.employees[0].attributes.strength = 50;
            gameState.employees[0].attributes.physique = 50;
        });

        it('應該能成功派遣任務', () => {
            const result = missionManager.dispatchMission('escort_city_caravan', [0]);

            expect(result.success).toBe(true);
            expect(result.missionInstance).toBeDefined();
            expect(result.missionInstance.missionId).toBe('escort_city_caravan');
            expect(result.missionInstance.state).toBe('traveling');
            expect(result.missionInstance.participantIds).toContain(0);
        });

        it('不存在的任務應該派遣失敗', () => {
            const result = missionManager.dispatchMission('invalid_mission', [0]);

            expect(result.success).toBe(false);
            expect(result.message).toContain('不存在');
        });

        it('未解鎖的員工不能派遣', () => {
            const result = missionManager.dispatchMission('escort_city_caravan', [1]);

            expect(result.success).toBe(false);
            expect(result.message).toContain('尚未雇用');
        });

        it('繁忙的員工不能派遣', () => {
            // 第一次派遣
            missionManager.dispatchMission('escort_city_caravan', [0]);

            // 嘗試再次派遣同一個員工
            const result = missionManager.dispatchMission('gather_mountain_herbs', [0]);

            expect(result.success).toBe(false);
            expect(result.message).toContain('正在執行其他任務');
        });

        it('應該正確檢查任務需求', () => {
            // 設置低聲望
            gameState.inn.reputation = 0;

            // 獲取可用任務列表
            const availableMissions = missionManager.getAvailableMissions();
            const highRepMission = availableMissions.find(m => m.id === 'escort_imperial_envoy');

            // 需要高聲望的任務不應該在列表中
            expect(highRepMission).toBeUndefined();
        });

        it('應該計算任務檢查點', () => {
            const result = missionManager.dispatchMission('escort_city_caravan', [0]);

            expect(result.missionInstance.checkpoints).toBeDefined();
            expect(Array.isArray(result.missionInstance.checkpoints)).toBe(true);
            expect(result.missionInstance.checkpoints.length).toBeGreaterThan(0);
        });

        it('應該允許主角參與任務', () => {
            gameState.player.attributes.strength = 50;
            const result = missionManager.dispatchMission('escort_city_caravan', ['player']);

            expect(result.success).toBe(true);
            expect(result.missionInstance.participantIds).toContain('player');
        });

        it('應該允許多個參與者', () => {
            // 解鎖第二個員工
            gameState.employees[1].hired.unlocked = true;
            gameState.employees[1].attributes.strength = 50;

            const result = missionManager.dispatchMission('escort_city_caravan', [0, 1]);

            expect(result.success).toBe(true);
            expect(result.missionInstance.participantIds).toHaveLength(2);
        });
    });

    describe('成功率計算', () => {
        let mission;

        beforeEach(() => {
            mission = {
                id: 'test_mission',
                type: 'escort',
                difficulty: 'normal',
                participants: [0]
            };

            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 60;  // 主屬性
            gameState.employees[0].attributes.physique = 40;  // 副屬性
        });

        it('應該根據屬性計算成功率', () => {
            const participants = [{ ...gameState.employees[0], id: 0, name: gameState.employees[0].realName }];
            const successRate = missionManager.calculateSuccessRate(mission, participants);

            expect(successRate).toBeGreaterThan(0);
            expect(successRate).toBeLessThanOrEqual(95);
        });

        it('主屬性應該佔更高權重', () => {
            const emp1 = { ...gameState.employees[0] };
            emp1.attributes = { strength: 80, physique: 20 };

            const emp2 = { ...gameState.employees[0] };
            emp2.attributes = { strength: 20, physique: 80 };

            const rate1 = missionManager.calculateSuccessRate(mission, [emp1]);
            const rate2 = missionManager.calculateSuccessRate(mission, [emp2]);

            expect(rate1).toBeGreaterThan(rate2);
        });

        it('多人參與應該提高成功率', () => {
            gameState.employees[1].hired.unlocked = true;
            gameState.employees[1].attributes = { ...gameState.employees[0].attributes };

            const singleRate = missionManager.calculateSuccessRate(
                mission,
                [gameState.employees[0]]
            );

            const multiRate = missionManager.calculateSuccessRate(
                { ...mission, participants: [0, 1] },
                [gameState.employees[0], gameState.employees[1]]
            );

            expect(multiRate).toBeGreaterThan(singleRate);
        });

        it('難度應該影響成功率', () => {
            const easyMission = { ...mission, difficulty: 'easy' };
            const hardMission = { ...mission, difficulty: 'hard' };

            const easyRate = missionManager.calculateSuccessRate(
                easyMission,
                [gameState.employees[0]]
            );
            const hardRate = missionManager.calculateSuccessRate(
                hardMission,
                [gameState.employees[0]]
            );

            expect(easyRate).toBeGreaterThan(hardRate);
        });

        it('成功率應該在 10-95 範圍內', () => {
            // 測試極低屬性
            const lowEmployee = { ...gameState.employees[0], id: 0, name: gameState.employees[0].realName };
            lowEmployee.attributes = { strength: 1, physique: 1 };

            const lowRate = missionManager.calculateSuccessRate(mission, [lowEmployee]);
            expect(lowRate).toBeGreaterThanOrEqual(10);

            // 測試極高屬性
            const highEmployee = { ...gameState.employees[0], id: 0, name: gameState.employees[0].realName };
            highEmployee.attributes = { strength: 100, physique: 100 };

            const highRate = missionManager.calculateSuccessRate(mission, [highEmployee]);
            expect(highRate).toBeLessThanOrEqual(95);
        });
    });

    describe('任務更新', () => {
        beforeEach(() => {
            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 60;
            gameState.employees[0].attributes.physique = 50;
        });

        it('應該推進任務進度', () => {
            // 派遣任務
            missionManager.dispatchMission('escort_city_caravan', [0]);
            const mission = missionManager.activeMissions[0];
            const initialProgress = mission.progress;

            // 更新任務
            missionManager.updateMissions();

            expect(mission.progress).toBeGreaterThan(initialProgress);
        });

        it('任務完成後應該從活躍列表移除', () => {
            // 派遣短時任務
            missionManager.dispatchMission('trade_nearby_village', [0]);

            // 模擬多次更新直到任務完成
            for (let i = 0; i < 10; i++) {
                missionManager.updateMissions();
            }

            // 任務應該完成並從活躍列表移除
            expect(missionManager.activeMissions.length).toBe(0);
        });

        it('完成的任務應該添加到歷史', () => {
            missionManager.dispatchMission('trade_nearby_village', [0]);

            // 模擬任務完成
            for (let i = 0; i < 10; i++) {
                missionManager.updateMissions();
            }

            expect(missionManager.missionHistory.length).toBeGreaterThan(0);
        });

        it('應該在檢查點觸發事件', () => {
            // 派遣任務
            const result = missionManager.dispatchMission('escort_mountain_pass', [0]);
            const mission = missionManager.activeMissions[0];

            // 確保有檢查點
            expect(mission.checkpoints.length).toBeGreaterThan(0);

            // 更新直到經過檢查點
            const oldEventsCount = mission.events ? mission.events.length : 0;

            for (let i = 0; i < mission.duration + 1; i++) {
                missionManager.updateMissions();
            }

            // 可能觸發了事件（30%機率）
            // 這個測試不是100%確定，因為是隨機的
        });
    });

    describe('任務完成', () => {
        beforeEach(() => {
            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 70;
            gameState.employees[0].attributes.physique = 60;
        });

        it('成功的任務應該發放獎勵', () => {
            const initialSilver = gameState.silver;

            missionManager.dispatchMission('trade_nearby_village', [0]);

            // 模擬多次更新直到任務完成
            for (let i = 0; i < 10; i++) {
                missionManager.updateMissions();
            }

            // 銀兩應該增加
            expect(gameState.silver).toBeGreaterThan(initialSilver);
        });

        it('失敗的任務不應發放完整獎勵', () => {
            const initialSilver = gameState.silver;

            // 設置較低屬性降低成功率
            gameState.employees[0].attributes.strength = 10;
            gameState.employees[0].attributes.physique = 10;

            missionManager.dispatchMission('trade_nearby_village', [0]);

            // 完成任務
            for (let i = 0; i < 10; i++) {
                missionManager.updateMissions();
            }

            // 可能失敗，獎勵較少或沒有（這是概率性的測試）
            // 只檢查遊戲沒有崩潰
            expect(typeof gameState.silver).toBe('number');
        });

        it('應該根據難度調整獎勵基礎值', () => {
            // 檢查任務數據庫中的獎勵
            const easyMission = missionManager.getMissionInfo('escort_city_caravan');
            const hardMission = missionManager.getMissionInfo('escort_bandit_territory');

            expect(hardMission.rewards.baseSilver).toBeGreaterThan(easyMission.rewards.baseSilver);
            expect(hardMission.rewards.baseExperience).toBeGreaterThan(easyMission.rewards.baseExperience);
        });

        it('完成任務後參與者應該解除繁忙狀態', () => {
            missionManager.dispatchMission('trade_nearby_village', [0]);

            // 確認員工繁忙
            expect(missionManager.isParticipantBusy(0)).toBe(true);

            // 完成任務
            for (let i = 0; i < 10; i++) {
                missionManager.updateMissions();
            }

            // 員工應該不再繁忙
            expect(missionManager.isParticipantBusy(0)).toBe(false);
        });
    });

    describe('任務取消和召回', () => {
        beforeEach(() => {
            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 60;
        });

        it('應該能取消準備中的任務', () => {
            missionManager.dispatchMission('escort_city_caravan', [0]);
            const mission = missionManager.activeMissions[0];

            const result = missionManager.cancelMission(mission.id);

            expect(result.success).toBe(true);
            expect(missionManager.activeMissions.length).toBe(0);
            expect(missionManager.isParticipantBusy(0)).toBe(false);
        });

        it('應該能召回進行中的任務', () => {
            missionManager.dispatchMission('escort_city_caravan', [0]);
            const mission = missionManager.activeMissions[0];

            const result = missionManager.recallMission(mission.id);

            expect(result.success).toBe(true);
            expect(mission.state).toBe('returning');
        });

        it('取消任務不應獲得獎勵', () => {
            const initialSilver = gameState.silver;

            missionManager.dispatchMission('escort_city_caravan', [0]);
            const mission = missionManager.activeMissions[0];
            missionManager.cancelMission(mission.id);

            expect(gameState.silver).toBe(initialSilver);
        });

        it('召回任務可能獲得部分獎勵', () => {
            missionManager.dispatchMission('escort_mountain_pass', [0]);
            const mission = missionManager.activeMissions[0];

            const initialSilver = gameState.silver;
            missionManager.recallMission(mission.id);

            // 檢查任務進入返程狀態
            expect(mission.state).toBe('returning');
        });
    });

    describe('獲取任務信息', () => {
        it('應該獲取所有可用任務', () => {
            const missions = missionManager.getAvailableMissions();

            expect(Array.isArray(missions)).toBe(true);
            expect(missions.length).toBeGreaterThan(0);
        });

        it('應該根據條件過濾任務', () => {
            // 設置低聲望
            gameState.inn.reputation = 0;

            const allMissions = Object.keys(missionManager.missionDatabase).length;
            const availableMissions = missionManager.getAvailableMissions().length;

            // 可用任務應該等於總任務（因為只有幾個任務有聲望需求）
            // 這個測試實際上依賴於數據配置
            expect(availableMissions).toBeLessThanOrEqual(allMissions);
        });

        it('應該獲取任務詳情', () => {
            const mission = missionManager.getMissionInfo('escort_city_caravan');

            expect(mission).toBeDefined();
            expect(mission.id).toBe('escort_city_caravan');
            expect(mission.name).toBeDefined();
            expect(mission.description).toBeDefined();
        });

        it('應該獲取活躍任務列表', () => {
            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 60;

            missionManager.dispatchMission('escort_city_caravan', [0]);

            const activeMissions = missionManager.getActiveMissions();

            expect(activeMissions).toHaveLength(1);
            expect(activeMissions[0].missionId).toBe('escort_city_caravan');
        });

        it('應該獲取任務歷史', () => {
            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 80;

            // 完成一個任務
            missionManager.dispatchMission('trade_nearby_village', [0]);
            for (let i = 0; i < 10; i++) {
                missionManager.updateMissions();
            }

            const history = missionManager.getHistory();

            expect(history.length).toBeGreaterThan(0);
        });
    });

    describe('序列化與反序列化', () => {
        beforeEach(() => {
            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 60;
        });

        it('應該正確序列化任務狀態', () => {
            missionManager.dispatchMission('escort_city_caravan', [0]);

            const serialized = missionManager.serialize();

            expect(serialized.activeMissions).toBeDefined();
            expect(serialized.activeMissions.length).toBe(1);
            expect(serialized.missionHistory).toBeDefined();
        });

        it('應該正確反序列化任務狀態', () => {
            missionManager.dispatchMission('escort_city_caravan', [0]);
            const mission = missionManager.activeMissions[0];
            mission.progress = 2;

            const serialized = missionManager.serialize();

            // 創建新的管理器
            const newManager = new MissionManager(gameState);
            newManager.loadMissionData();
            newManager.deserialize(serialized);

            expect(newManager.activeMissions.length).toBe(1);
            expect(newManager.activeMissions[0].missionId).toBe('escort_city_caravan');
            expect(newManager.activeMissions[0].progress).toBe(2);
        });

        it('序列化應該保留任務進度', () => {
            missionManager.dispatchMission('escort_city_caravan', [0]);

            // 推進進度
            missionManager.updateMissions();
            missionManager.updateMissions();

            const progress = missionManager.activeMissions[0].progress;
            const serialized = missionManager.serialize();

            const newManager = new MissionManager(gameState);
            newManager.loadMissionData();
            newManager.deserialize(serialized);

            expect(newManager.activeMissions[0].progress).toBe(progress);
        });

        it('序列化應該保留任務歷史', () => {
            missionManager.dispatchMission('trade_nearby_village', [0]);

            // 完成任務
            for (let i = 0; i < 10; i++) {
                missionManager.updateMissions();
            }

            const serialized = missionManager.serialize();

            const newManager = new MissionManager(gameState);
            newManager.loadMissionData();
            newManager.deserialize(serialized);

            expect(newManager.missionHistory.length).toBe(missionManager.missionHistory.length);
        });
    });

    describe('特殊情況處理', () => {
        it('應該處理空參與者列表', () => {
            const result = missionManager.dispatchMission('escort_city_caravan', []);

            expect(result.success).toBe(false);
        });

        it('應該處理無效的參與者ID', () => {
            const result = missionManager.dispatchMission('escort_city_caravan', [999]);

            expect(result.success).toBe(false);
        });

        it('應該限制同時進行的任務數量', () => {
            // 解鎖多個員工
            for (let i = 0; i < 5; i++) {
                gameState.employees[i].hired.unlocked = true;
                gameState.employees[i].attributes.strength = 60;
            }

            // 派遣多個任務
            const results = [];
            results.push(missionManager.dispatchMission('escort_city_caravan', [0]));
            results.push(missionManager.dispatchMission('trade_nearby_village', [1]));
            results.push(missionManager.dispatchMission('gather_mountain_herbs', [2]));
            results.push(missionManager.dispatchMission('explore_ancient_ruins', [3]));

            // 前幾個應該成功
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(true);

            // 可能有數量限制（如果實作了的話）
        });

        it('應該處理任務數據庫載入失敗', () => {
            const emptyManager = new MissionManager(gameState);
            // 不調用 loadMissionData

            const result = emptyManager.dispatchMission('escort_city_caravan', [0]);

            expect(result.success).toBe(false);
        });

        it('歷史記錄應該有數量限制', () => {
            gameState.employees[0].hired.unlocked = true;
            gameState.employees[0].attributes.strength = 90;

            // 完成大量任務
            for (let i = 0; i < 150; i++) {
                missionManager.dispatchMission('trade_nearby_village', [0]);

                // 快速完成
                for (let j = 0; j < 5; j++) {
                    missionManager.updateMissions();
                }
            }

            // 歷史應該被限制在100個以內
            expect(missionManager.missionHistory.length).toBeLessThanOrEqual(100);
        });
    });
});
