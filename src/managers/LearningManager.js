/**
 * 學習管理器
 * 管理讀書、拜師、練習等學習系統
 */

class LearningManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.bookDatabase = {};  // 書籍數據庫
        this.teacherDatabase = {}; // 師傅數據庫（員工）
        this.trainingDatabase = {}; // 訓練項目數據庫
    }

    /**
     * 載入書籍數據
     */
    loadBookData() {
        try {
            this.bookDatabase = require('../data/books.json');
            return { success: true, count: Object.keys(this.bookDatabase).length };
        } catch (e) {
            console.warn('書籍數據載入失敗:', e.message);
            this.bookDatabase = {};
            return { success: false, error: e.message };
        }
    }

    /**
     * 讀書學習
     * @param {string} bookId - 書籍ID
     * @param {number} hours - 學習時數
     */
    study(bookId, hours = 1) {
        const book = this.bookDatabase[bookId];

        if (!book) {
            return { success: false, message: "書籍不存在" };
        }

        // 檢查是否擁有該書
        if (!this.gameState.inventory.hasItem(bookId)) {
            return { success: false, message: "未擁有該書籍" };
        }

        // 檢查閱讀需求
        if (book.requirements) {
            const reqCheck = this.checkRequirements(book.requirements);
            if (!reqCheck.success) {
                return reqCheck;
            }
        }

        // 計算學習效果（智慧影響學習效率）
        const baseEfficiency = 1.0;
        const intelligenceBonus = (this.gameState.player.attributes.intelligence - 10) * 0.02;
        const efficiency = baseEfficiency + intelligenceBonus;

        // 應用學習效果
        const results = [];

        if (book.effects) {
            for (const effect of book.effects) {
                const actualValue = Math.floor(effect.value * efficiency * hours);

                switch (effect.type) {
                    case 'attribute':
                        this.gameState.player.addAttribute(effect.key, actualValue);
                        results.push({
                            type: 'attribute',
                            key: effect.key,
                            value: actualValue
                        });
                        break;

                    case 'experience':
                        this.gameState.player.addExperience(actualValue);
                        results.push({
                            type: 'experience',
                            value: actualValue
                        });
                        break;

                    case 'skill':
                        const skillResult = this.gameState.player.addSkill(effect.skillId, effect.level || 1);
                        if (skillResult.success) {
                            results.push({
                                type: 'skill',
                                skillId: effect.skillId
                            });
                        }
                        break;
                }
            }
        }

        // 增加疲勞
        this.gameState.player.addFatigue(hours * 5);

        return {
            success: true,
            bookTitle: book.title,
            hoursSpent: hours,
            efficiency: efficiency,
            results: results,
            message: `閱讀《${book.title}》${hours}小時，獲得了新的知識！`
        };
    }

    /**
     * 拜師學藝
     * @param {number} teacherId - 師傅ID（員工ID）
     * @param {string} skillType - 技能類型
     * @param {number} sessions - 學習次數
     */
    apprentice(teacherId, skillType, sessions = 1) {
        const teacher = this.gameState.employees[teacherId];

        if (!teacher) {
            return { success: false, message: "師傅不存在" };
        }

        // 檢查員工是否已雇用
        if (!teacher.hired || !teacher.hired.unlocked) {
            return { success: false, message: "該員工尚未加入客棧" };
        }

        // 檢查好感度（至少需要朋友等級才能拜師）
        if (!teacher.affection || teacher.affection.relationship === 'stranger' || teacher.affection.relationship === 'acquaintance') {
            return { success: false, message: "好感度不足，需要達到朋友等級" };
        }

        // 檢查師傅是否擁有該技能
        const teacherAttribute = this.getTeacherAttribute(skillType, teacher);

        if (teacherAttribute === null) {
            return { success: false, message: "師傅不擅長此技能" };
        }

        // 計算學習效果（基於師傅的屬性和好感度）
        const affectionBonus = (teacher.affection.points / 100) * 0.5;
        const teacherBonus = (teacherAttribute - 50) * 0.01;
        const efficiency = 1.0 + affectionBonus + teacherBonus;

        const results = [];

        for (let i = 0; i < sessions; i++) {
            // 隨機決定學習內容
            const learningType = this.getSkillLearningType(skillType);

            const gain = Math.floor(learningType.baseGain * efficiency);
            this.gameState.player.addAttribute(learningType.attribute, gain);

            results.push({
                attribute: learningType.attribute,
                gain: gain
            });
        }

        // 增加師傅好感度
        if (this.gameState.affectionManager) {
            this.gameState.affectionManager.addAffection(teacherId, sessions * 2, '拜師學藝');
        }

        // 增加疲勞
        this.gameState.player.addFatigue(sessions * 10);

        return {
            success: true,
            teacher: teacher.realName || teacher.name,
            skillType: skillType,
            sessions: sessions,
            efficiency: efficiency,
            results: results,
            message: `向${teacher.realName || teacher.name}學習${skillType}，收穫頗豐！`
        };
    }

    /**
     * 獲取師傅對應的屬性值
     */
    getTeacherAttribute(skillType, teacher) {
        const skillMap = {
            '烹飪': 'dexterity',
            '武藝': 'strength',
            '經營': 'intelligence',
            '口才': 'charisma',
            '醫術': 'intelligence',
            '靈巧': 'dexterity'
        };

        const attribute = skillMap[skillType];
        if (!attribute) return null;

        return teacher.attributes[attribute] || null;
    }

    /**
     * 獲取技能學習類型
     */
    getSkillLearningType(skillType) {
        const types = {
            '烹飪': { attribute: 'dexterity', baseGain: 2 },
            '武藝': { attribute: 'strength', baseGain: 2 },
            '經營': { attribute: 'intelligence', baseGain: 2 },
            '口才': { attribute: 'charisma', baseGain: 2 },
            '醫術': { attribute: 'intelligence', baseGain: 2 },
            '靈巧': { attribute: 'dexterity', baseGain: 2 }
        };

        return types[skillType] || { attribute: 'intelligence', baseGain: 1 };
    }

    /**
     * 練習訓練
     * @param {string} trainingType - 訓練類型
     * @param {number} hours - 訓練時數
     */
    practice(trainingType, hours = 1) {
        const validTypes = {
            '體能訓練': { attribute: 'physique', baseGain: 1, fatigueCost: 15 },
            '武術訓練': { attribute: 'strength', baseGain: 1, fatigueCost: 12 },
            '靈巧訓練': { attribute: 'dexterity', baseGain: 1, fatigueCost: 10 },
            '讀書習字': { attribute: 'intelligence', baseGain: 1, fatigueCost: 5 },
            '社交訓練': { attribute: 'charisma', baseGain: 1, fatigueCost: 8 }
        };

        const training = validTypes[trainingType];

        if (!training) {
            return { success: false, message: "無效的訓練類型" };
        }

        // 檢查疲勞（太累無法訓練）
        if (this.gameState.player.status.fatigue > 80) {
            return { success: false, message: "太疲勞了，需要休息" };
        }

        // 計算訓練效果
        const totalGain = training.baseGain * hours;
        this.gameState.player.addAttribute(training.attribute, totalGain);

        // 增加經驗
        this.gameState.player.addExperience(hours * 5);

        // 增加疲勞
        this.gameState.player.addFatigue(training.fatigueCost * hours);

        return {
            success: true,
            trainingType: trainingType,
            hours: hours,
            attribute: training.attribute,
            gain: totalGain,
            message: `完成${hours}小時的${trainingType}！`
        };
    }

    /**
     * 檢查需求
     */
    checkRequirements(requirements) {
        if (requirements.level) {
            if (this.gameState.player.experience.level < requirements.level) {
                return {
                    success: false,
                    message: `需要等級 ${requirements.level}`
                };
            }
        }

        if (requirements.attributes) {
            for (const [attr, value] of Object.entries(requirements.attributes)) {
                if (this.gameState.player.attributes[attr] < value) {
                    return {
                        success: false,
                        message: `需要${attr} ${value}`
                    };
                }
            }
        }

        return { success: true };
    }

    /**
     * 獲取可拜師的員工列表
     */
    getAvailableTeachers() {
        return this.gameState.employees
            .filter(e => e.hired && e.hired.unlocked)
            .filter(e => e.affection && (e.affection.relationship === 'friend' || e.affection.relationship === 'close_friend' || e.affection.relationship === 'lover'))
            .map(e => ({
                id: e.id,
                name: e.realName || e.name,
                attributes: e.attributes,
                affection: e.affection.relationship,
                affectionPoints: e.affection.points,
                specialties: this.getEmployeeSpecialties(e)
            }));
    }

    /**
     * 獲取員工的專長
     */
    getEmployeeSpecialties(employee) {
        const specialties = [];
        const attrs = employee.attributes;

        if (attrs.dexterity >= 60) specialties.push('烹飪', '靈巧');
        if (attrs.strength >= 60) specialties.push('武藝');
        if (attrs.intelligence >= 60) specialties.push('經營', '醫術');
        if (attrs.charisma >= 60) specialties.push('口才');

        return specialties;
    }

    /**
     * 獲取學習進度摘要
     */
    getLearningProgress() {
        return {
            player: {
                level: this.gameState.player.experience.level,
                attributes: this.gameState.player.attributes,
                skills: this.gameState.player.skills.length,
                fatigue: this.gameState.player.status.fatigue
            },
            availableTeachers: this.getAvailableTeachers().length,
            ownedBooks: this.getOwnedBooks().length
        };
    }

    /**
     * 獲取擁有的書籍
     */
    getOwnedBooks() {
        const allItems = this.gameState.inventory.getAllItems();
        const books = [];

        for (const [itemId, quantity] of Object.entries(allItems)) {
            if (this.bookDatabase[itemId]) {
                books.push({
                    id: itemId,
                    ...this.bookDatabase[itemId],
                    quantity: quantity
                });
            }
        }

        return books;
    }

    /**
     * 序列化（學習數據在Player中，不需要單獨序列化）
     */
    serialize() {
        return {};
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        // 學習數據由 GameState 和 Player 恢復
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningManager;
}
