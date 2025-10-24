/**
 * 主角類別
 * 管理主角的屬性、個性、裝備、技能
 */

class Player {
    constructor(name = "未命名") {
        // 基本資訊
        this.name = name;
        this.age = 20;
        this.gender = "male";  // male/female

        // 核心屬性（0-100）
        this.attributes = {
            physique: 10,        // 體質（影響疲勞恢復、負重、健康）
            strength: 10,        // 武力（影響戰鬥、護衛、體力勞動）
            intelligence: 10,    // 智慧（影響學習、研究、管理）
            charisma: 10,        // 口才（影響談判、招待、人際關係）
            dexterity: 10        // 靈巧（影響烹飪、製作、精細工作）
        };

        // 個性系統（-100 到 +100）
        this.personality = {
            righteous: 0,        // 正義 ←→ 邪惡
            benevolent: 0,       // 仁慈 ←→ 冷酷
            cautious: 0,         // 謹慎 ←→ 冒險
            frugal: 0,           // 節儉 ←→ 奢侈
            humble: 0            // 謙遜 ←→ 傲慢
        };

        // 狀態
        this.status = {
            fatigue: 0,          // 疲勞值（0-100，越高越累）
            health: 100,         // 健康值（0-100）
            mood: 50             // 心情（0-100，影響工作效率）
        };

        // 裝備
        this.equipment = {
            weapon: null,        // 武器 ID
            armor: null,         // 護甲 ID
            accessory: null      // 配飾 ID
        };

        // 技能列表
        this.skills = [
            // { id: 'skill_001', level: 1, exp: 0, maxLevel: 10 }
        ];

        // 經驗值系統
        this.experience = {
            total: 0,
            level: 1,
            nextLevelExp: 100
        };
    }

    /**
     * 增加屬性
     */
    addAttribute(attr, value) {
        if (!this.attributes.hasOwnProperty(attr)) {
            return { success: false, message: "無效的屬性" };
        }

        this.attributes[attr] = Math.min(100, Math.max(0, this.attributes[attr] + value));

        return {
            success: true,
            attribute: attr,
            newValue: this.attributes[attr]
        };
    }

    /**
     * 改變個性
     */
    changePersonality(axis, value) {
        if (!this.personality.hasOwnProperty(axis)) {
            return { success: false, message: "無效的個性軸" };
        }

        this.personality[axis] = Math.min(100, Math.max(-100, this.personality[axis] + value));

        return {
            success: true,
            axis: axis,
            newValue: this.personality[axis]
        };
    }

    /**
     * 獲取個性傾向描述
     */
    getPersonalityDescription(axis) {
        const value = this.personality[axis];
        const descriptions = {
            righteous: {
                positive: ["正義", "俠義", "極度正義"],
                negative: ["邪惡", "陰險", "極度邪惡"]
            },
            benevolent: {
                positive: ["仁慈", "慈悲", "極度仁慈"],
                negative: ["冷酷", "無情", "極度冷酷"]
            },
            cautious: {
                positive: ["謹慎", "小心", "極度謹慎"],
                negative: ["冒險", "魯莽", "極度魯莽"]
            },
            frugal: {
                positive: ["節儉", "樸素", "極度節儉"],
                negative: ["奢侈", "揮霍", "極度奢侈"]
            },
            humble: {
                positive: ["謙遜", "謙虛", "極度謙遜"],
                negative: ["傲慢", "自大", "極度傲慢"]
            }
        };

        const desc = descriptions[axis];
        if (!desc) return "中立";

        if (value >= 60) return desc.positive[2];
        if (value >= 30) return desc.positive[1];
        if (value > 0) return desc.positive[0];
        if (value <= -60) return desc.negative[2];
        if (value <= -30) return desc.negative[1];
        if (value < 0) return desc.negative[0];
        return "中立";
    }

    /**
     * 增加疲勞值
     */
    addFatigue(amount) {
        this.status.fatigue = Math.min(100, this.status.fatigue + amount);

        // 疲勞過高影響心情
        if (this.status.fatigue > 80) {
            this.status.mood = Math.max(0, this.status.mood - 1);
        }

        return { fatigue: this.status.fatigue };
    }

    /**
     * 恢復疲勞（休息）
     */
    rest(hours) {
        const recovery = hours * (this.attributes.physique / 10);
        this.status.fatigue = Math.max(0, this.status.fatigue - recovery);

        // 充分休息改善心情
        if (this.status.fatigue < 30) {
            this.status.mood = Math.min(100, this.status.mood + 2);
        }

        return { fatigue: this.status.fatigue, mood: this.status.mood };
    }

    /**
     * 改變心情
     */
    changeMood(amount) {
        this.status.mood = Math.min(100, Math.max(0, this.status.mood + amount));
        return { mood: this.status.mood };
    }

    /**
     * 改變健康值
     */
    changeHealth(amount) {
        this.status.health = Math.min(100, Math.max(0, this.status.health + amount));

        // 健康過低影響心情
        if (this.status.health < 30) {
            this.status.mood = Math.max(0, this.status.mood - 5);
        }

        return { health: this.status.health };
    }

    /**
     * 裝備物品
     */
    equip(slot, itemId) {
        if (!this.equipment.hasOwnProperty(slot)) {
            return { success: false, message: "無效的裝備欄位" };
        }

        const oldItem = this.equipment[slot];
        this.equipment[slot] = itemId;

        return {
            success: true,
            slot: slot,
            oldItem: oldItem,
            newItem: itemId
        };
    }

    /**
     * 卸下裝備
     */
    unequip(slot) {
        if (!this.equipment.hasOwnProperty(slot)) {
            return { success: false, message: "無效的裝備欄位" };
        }

        const item = this.equipment[slot];
        this.equipment[slot] = null;

        return {
            success: true,
            slot: slot,
            item: item
        };
    }

    /**
     * 增加技能
     */
    addSkill(skillId, level = 1) {
        const existingSkill = this.skills.find(s => s.id === skillId);

        if (existingSkill) {
            return { success: false, message: "已擁有此技能" };
        }

        this.skills.push({
            id: skillId,
            level: level,
            exp: 0,
            maxLevel: 10
        });

        return { success: true, skillId };
    }

    /**
     * 升級技能
     */
    upgradeSkill(skillId, expGain = 0) {
        const skill = this.skills.find(s => s.id === skillId);

        if (!skill) {
            return { success: false, message: "未擁有此技能" };
        }

        skill.exp += expGain;

        // 檢查是否升級
        const expNeeded = skill.level * 100;
        if (skill.exp >= expNeeded && skill.level < skill.maxLevel) {
            skill.level++;
            skill.exp -= expNeeded;

            return {
                success: true,
                levelUp: true,
                newLevel: skill.level
            };
        }

        return {
            success: true,
            levelUp: false,
            exp: skill.exp
        };
    }

    /**
     * 增加經驗值
     */
    addExperience(exp) {
        this.experience.total += exp;

        // 檢查升級
        while (this.experience.total >= this.experience.nextLevelExp) {
            this.experience.total -= this.experience.nextLevelExp;
            this.experience.level++;
            this.experience.nextLevelExp = this.experience.level * 100;

            // 升級時恢復狀態
            this.status.fatigue = Math.max(0, this.status.fatigue - 20);
            this.status.health = Math.min(100, this.status.health + 10);
            this.status.mood = Math.min(100, this.status.mood + 10);
        }

        return {
            level: this.experience.level,
            total: this.experience.total,
            nextLevelExp: this.experience.nextLevelExp
        };
    }

    /**
     * 獲取總屬性（基礎 + 裝備加成）
     * 需要 EquipmentManager 來計算裝備加成
     */
    getTotalAttributes(equipmentBonus = {}) {
        const total = {};

        for (const [attr, value] of Object.entries(this.attributes)) {
            total[attr] = value + (equipmentBonus[attr] || 0);
        }

        return total;
    }

    /**
     * 序列化（存檔）
     */
    serialize() {
        return {
            name: this.name,
            age: this.age,
            gender: this.gender,
            attributes: { ...this.attributes },
            personality: { ...this.personality },
            status: { ...this.status },
            equipment: { ...this.equipment },
            skills: this.skills.map(s => ({ ...s })),
            experience: { ...this.experience }
        };
    }

    /**
     * 反序列化（讀檔）
     */
    deserialize(data) {
        if (data.name) this.name = data.name;
        if (data.age) this.age = data.age;
        if (data.gender) this.gender = data.gender;

        if (data.attributes) {
            this.attributes = { ...data.attributes };
        }

        if (data.personality) {
            this.personality = { ...data.personality };
        }

        if (data.status) {
            this.status = { ...data.status };
        }

        if (data.equipment) {
            this.equipment = { ...data.equipment };
        }

        if (data.skills) {
            this.skills = data.skills.map(s => ({ ...s }));
        }

        if (data.experience) {
            this.experience = { ...data.experience };
        }
    }

    /**
     * 獲取玩家摘要
     */
    getSummary() {
        return {
            基本資訊: {
                姓名: this.name,
                年齡: this.age,
                性別: this.gender === 'male' ? '男' : '女',
                等級: this.experience.level
            },
            屬性: this.attributes,
            個性: {
                正邪: this.getPersonalityDescription('righteous'),
                善惡: this.getPersonalityDescription('benevolent'),
                謹慎: this.getPersonalityDescription('cautious'),
                財富觀: this.getPersonalityDescription('frugal'),
                態度: this.getPersonalityDescription('humble')
            },
            狀態: {
                疲勞: `${this.status.fatigue}/100`,
                健康: `${this.status.health}/100`,
                心情: `${this.status.mood}/100`
            },
            技能數: this.skills.length
        };
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
