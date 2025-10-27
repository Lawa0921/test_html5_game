/**
 * 員工數據模板
 * 技能等級轉換規則：S=85, A=75, B=65, C=55, D=45
 */

const EMPLOYEE_TEMPLATES = [
    // === 0. 掌櫃 - 沈青山 ===
    {
        id: 0,
        name: '掌櫃',
        realName: '沈青山',
        type: 'manager',
        // characterId: '007',  // 角色暫未實作，使用 NPC 資源
        portrait: 'assets/characters/npc/accountant_portrait.svg',  // 暫用賬房 NPC
        avatar: 'assets/characters/npc/accountant_avatar.svg',

        // 背景故事
        story: {
            background: '前朝皇室後裔，隱姓埋名經營客棧',
            personality: '沉穩幹練，處事公正',
            preference: '喜歡棋局、歷史典籍'
        },

        // 雇用狀態
        hired: {
            unlocked: true,
            cost: 0,
            salary: 100,
            joinDate: 1
        },

        // 核心屬性（基於原skills轉換）
        // 原：cooking:B, service:A, combat:A, medicine:C, entertainment:B, management:S, crafting:C
        attributes: {
            physique: 60,        // 體質
            strength: 75,        // 武力（combat: A）
            intelligence: 85,    // 智慧（management: S）
            charisma: 75,        // 口才（service: A）
            dexterity: 65        // 靈巧（cooking: B）
        },

        // 成長率（擅長管理和口才）
        growthRate: {
            physique: 1.0,
            strength: 1.2,
            intelligence: 1.5,   // 最擅長
            charisma: 1.3,
            dexterity: 0.9
        },

        // 才能
        talents: [
            {
                id: "talent_born_leader",
                name: "天生領導",
                description: "管理工作效率+30%，智慧成長+20%",
                effects: {
                    workBonus: { management: 0.3 },
                    growthBonus: { intelligence: 0.2 }
                }
            }
        ],

        // 技能
        skills: [
            {
                id: "skill_accounting",
                name: "精打細算",
                type: "passive",
                level: 3,
                exp: 0,
                maxLevel: 10,
                description: "客棧收入+5%",
                effects: { incomeBonus: 0.05 }
            }
        ],

        // 狀態
        status: {
            fatigue: 0,
            health: 100,
            mood: 80,
            currentState: "IDLE"
        },

        // 工作分配
        work: {
            assignedStation: null,
            workHours: 0,
            efficiency: 1.0,
            experience: 0
        },

        // 裝備
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        },

        // 好感度
        affection: {
            level: 0,
            points: 0,
            relationship: "stranger",
            events: []
        },

        // 位置
        position: {
            scene: 'lobby',
            x: 220,
            y: 130
        },

        // 工作偏好
        preferredWork: ['management', 'lobby'],

        // 基礎屬性（保留舊的，用於兼容）
        description: '客棧的管理者，提升總體收入',
        incomeBonus: 0.1,
        unlockCost: 0,
        upgradeCost: 100,
        level: 1
    },

    // === 1. 廚師 - 孟四娘 ===
    {
        id: 1,
        name: '廚師',
        realName: '孟四娘',
        type: 'chef',
        portrait: 'assets/characters/npc/chef_portrait.svg',
        avatar: 'assets/characters/npc/chef_avatar.svg',

        story: {
            background: '御廚之女，五毒教叛徒',
            personality: '手藝精湛，性格火爆',
            preference: '喜歡珍稀食材、毒藥典籍'
        },

        hired: {
            unlocked: false,
            cost: 1000,
            salary: 150,
            joinDate: 0
        },

        // 原：cooking:S, service:C, combat:B, medicine:A, entertainment:D, management:C, crafting:B
        attributes: {
            physique: 65,
            strength: 65,        // combat: B
            intelligence: 75,    // medicine: A
            charisma: 55,        // service: C
            dexterity: 85        // cooking: S
        },

        growthRate: {
            physique: 1.1,
            strength: 1.1,
            intelligence: 1.3,
            charisma: 0.8,
            dexterity: 1.5       // 最擅長
        },

        talents: [
            {
                id: "talent_gourmet",
                name: "美食大師",
                description: "烹飪工作效率+40%，客人滿意度+20%",
                effects: {
                    workBonus: { kitchen: 0.4 },
                    customerSatisfaction: 0.2
                }
            }
        ],

        skills: [],

        status: { fatigue: 0, health: 100, mood: 70, currentState: "IDLE" },
        work: { assignedStation: null, workHours: 0, efficiency: 1.0, experience: 0 },
        equipment: { weapon: null, armor: null, accessory: null },
        affection: { level: 0, points: 0, relationship: "stranger", events: [] },
        position: { scene: 'lobby', x: 100, y: 200 },
        preferredWork: ['kitchen', 'medicine'],

        description: '烹飪美食，提升餐飲收入',
        incomeBonus: 0.15,
        unlockCost: 1000,
        upgradeCost: 100,
        level: 1
    },

    // === 2. 服務員 - 溫如玉 ===
    {
        id: 2,
        name: '服務員',
        realName: '溫如玉',
        type: 'waiter',
        // characterId: '003',  // 角色暫未實作，使用 NPC 資源
        portrait: 'assets/characters/npc/runner_portrait.svg',  // 暫用跑堂 NPC
        avatar: 'assets/characters/npc/runner_avatar.svg',

        story: {
            background: '沒落商賈之子，尋仇復國',
            personality: '溫文儒雅，心機深沉',
            preference: '喜歡古籍、棋局'
        },

        hired: {
            unlocked: false,
            cost: 800,
            salary: 120,
            joinDate: 0
        },

        // 原：cooking:C, service:S, combat:D, medicine:D, entertainment:A, management:B, crafting:D
        attributes: {
            physique: 50,
            strength: 45,        // combat: D
            intelligence: 65,    // management: B
            charisma: 85,        // service: S
            dexterity: 55        // cooking: C
        },

        growthRate: {
            physique: 0.9,
            strength: 0.8,
            intelligence: 1.2,
            charisma: 1.5,       // 最擅長
            dexterity: 0.9
        },

        talents: [
            {
                id: "talent_silver_tongue",
                name: "三寸不爛之舌",
                description: "說服成功率+25%，好感度獲得+20%",
                effects: {
                    persuasionBonus: 0.25,
                    affectionGain: 0.2
                }
            }
        ],

        skills: [],

        status: { fatigue: 0, health: 100, mood: 75, currentState: "IDLE" },
        work: { assignedStation: null, workHours: 0, efficiency: 1.0, experience: 0 },
        equipment: { weapon: null, armor: null, accessory: null },
        affection: { level: 0, points: 0, relationship: "stranger", events: [] },
        position: { scene: 'lobby', x: 300, y: 200 },
        preferredWork: ['lobby', 'entertainment'],

        description: '提升接待效率，增加客人滿意度',
        incomeBonus: 0.12,
        unlockCost: 800,
        upgradeCost: 100,
        level: 1
    },

    // === 3. 保鏢 - 蕭鐵峰 ===
    {
        id: 3,
        name: '保鏢',
        realName: '蕭鐵峰',
        type: 'guard',
        // characterId: '008',  // 角色暫未實作，使用 NPC 資源
        portrait: 'assets/characters/npc/doorman_portrait.svg',  // 暫用門童 NPC
        avatar: 'assets/characters/npc/doorman_avatar.svg',

        story: {
            background: '岳家軍後裔，退伍老兵',
            personality: '剛正不阿，忠肝義膽',
            preference: '喜歡兵書、武器'
        },

        hired: {
            unlocked: false,
            cost: 1500,
            salary: 180,
            joinDate: 0
        },

        // 原：cooking:D, service:D, combat:S, medicine:C, entertainment:C, management:B, crafting:C
        attributes: {
            physique: 80,        // 高體質
            strength: 85,        // combat: S
            intelligence: 65,    // management: B
            charisma: 45,        // service: D
            dexterity: 55        // crafting: C
        },

        growthRate: {
            physique: 1.4,
            strength: 1.5,       // 最擅長
            intelligence: 1.0,
            charisma: 0.7,
            dexterity: 0.9
        },

        talents: [
            {
                id: "talent_iron_will",
                name: "鋼鐵意志",
                description: "戰鬥力+30%，疲勞抗性+50%",
                effects: {
                    combatBonus: 0.3,
                    fatigueResistance: 0.5
                }
            }
        ],

        skills: [],

        status: { fatigue: 0, health: 100, mood: 60, currentState: "IDLE" },
        work: { assignedStation: null, workHours: 0, efficiency: 1.0, experience: 0 },
        equipment: { weapon: null, armor: null, accessory: null },
        affection: { level: 0, points: 0, relationship: "stranger", events: [] },
        position: { scene: 'lobby', x: 400, y: 150 },
        preferredWork: ['security'],

        description: '保護客棧安全，防止被打劫',
        incomeBonus: 0.05,
        unlockCost: 1500,
        upgradeCost: 120,
        level: 1
    },

    // === 4. 跑堂 - 林小風 ===
    {
        id: 4,
        name: '跑堂',
        realName: '林小風',
        type: 'runner',
        portrait: 'assets/characters/npc/runner_portrait.svg',
        avatar: 'assets/characters/npc/runner_avatar.svg',

        story: {
            background: '神秘少年，來歷不明',
            personality: '機靈活潑，天真爛漫',
            preference: '喜歡糖葫蘆、玩具'
        },

        hired: {
            unlocked: false,
            cost: 600,
            salary: 80,
            joinDate: 0
        },

        // 原：cooking:D, service:A, combat:B, medicine:D, entertainment:C, management:C, crafting:D
        attributes: {
            physique: 55,
            strength: 65,        // combat: B
            intelligence: 55,    // management: C
            charisma: 75,        // service: A
            dexterity: 60        // 靈巧
        },

        growthRate: {
            physique: 1.2,
            strength: 1.3,
            intelligence: 1.1,
            charisma: 1.4,
            dexterity: 1.3
        },

        talents: [
            {
                id: "talent_quick_feet",
                name: "腳程如飛",
                description: "移動速度+50%，工作效率+15%",
                effects: {
                    moveSpeed: 0.5,
                    workBonus: { all: 0.15 }
                }
            }
        ],

        skills: [],

        status: { fatigue: 0, health: 100, mood: 85, currentState: "IDLE" },
        work: { assignedStation: null, workHours: 0, efficiency: 1.0, experience: 0 },
        equipment: { weapon: null, armor: null, accessory: null },
        affection: { level: 0, points: 0, relationship: "stranger", events: [] },
        position: { scene: 'lobby', x: 250, y: 220 },
        preferredWork: ['lobby', 'kitchen'],

        description: '跑腿雜務，提升整體效率',
        incomeBonus: 0.08,
        unlockCost: 600,
        upgradeCost: 80,
        level: 1
    },

    // === 5-9 其他員工（簡化版，稍後補全）===
    // 這裡先創建佔位數據，保持 10 個員工
    ...generatePlaceholderEmployees(5, 9)
];

/**
 * 生成佔位員工數據（5-9）
 */
function generatePlaceholderEmployees(startId, endId) {
    const types = ['herbalist', 'storyteller', 'musician', 'accountant', 'doorman'];
    const names = ['藥師', '說書人', '樂師', '賬房', '門童'];
    const realNames = ['顧青崖', '方無忌', '蘇妙音', '李默然', '翠兒'];

    const employees = [];

    for (let i = startId; i <= endId; i++) {
        const index = i - startId;
        employees.push({
            id: i,
            name: names[index],
            realName: realNames[index],
            type: types[index],
            portrait: `assets/characters/npc/${types[index]}_portrait.svg`,
            avatar: `assets/characters/npc/${types[index]}_avatar.svg`,

            story: {
                background: '待補充',
                personality: '待補充',
                preference: '待補充'
            },

            hired: {
                unlocked: false,
                cost: 1000 + i * 100,
                salary: 100 + i * 20,
                joinDate: 0
            },

            attributes: {
                physique: 50 + Math.floor(Math.random() * 20),
                strength: 50 + Math.floor(Math.random() * 20),
                intelligence: 50 + Math.floor(Math.random() * 20),
                charisma: 50 + Math.floor(Math.random() * 20),
                dexterity: 50 + Math.floor(Math.random() * 20)
            },

            growthRate: {
                physique: 1.0,
                strength: 1.0,
                intelligence: 1.0,
                charisma: 1.0,
                dexterity: 1.0
            },

            talents: [],
            skills: [],

            status: { fatigue: 0, health: 100, mood: 70, currentState: "IDLE" },
            work: { assignedStation: null, workHours: 0, efficiency: 1.0, experience: 0 },
            equipment: { weapon: null, armor: null, accessory: null },
            affection: { level: 0, points: 0, relationship: "stranger", events: [] },
            position: { scene: 'lobby', x: 100 + i * 50, y: 100 + i * 20 },
            preferredWork: ['lobby'],

            description: '待補充',
            incomeBonus: 0.08,
            unlockCost: 1000 + i * 100,
            upgradeCost: 100,
            level: 1
        });
    }

    return employees;
}

module.exports = EMPLOYEE_TEMPLATES;
