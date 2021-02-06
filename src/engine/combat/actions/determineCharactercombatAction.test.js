import determineCharacterCombatAction from "./determineCharacterCombatAction";
import {Character} from "../../../character";
import {Decimal} from "decimal.js";
import calculateActionCost from "./calculateActionCost";

jest.mock("../../index");

describe('Tactics overwhelm + none', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("if the character has enough energy, they perform a power attack", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "simpleAttack"
        })).toEqual({
            primary: "powerAttack",
            enhancements: []
        });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "powerAttack"
        })).toEqual({
            primary: "powerAttack",
            enhancements: []
        });
    });
    it("if the character cannot perform a power attack, they perform a simple attack", function () {
        player.combat.stamina = calculateActionCost(player, {
            primary: "powerAttack",
            enhancements: []
        }, enemy).minus(1);
        expect(determineCharacterCombatAction(player, enemy)).toEqual({
            primary: "basicAttack",
            enhancements: []
        });
    });
    it("if the character cannot attack they do nothing", function () {
        player.combat.stamina = Decimal(0);
        expect(determineCharacterCombatAction(player, enemy)).toEqual({
            primary: "none",
            enhancements: []
        });
    });
});

describe('Tactics overwhelm + block', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "block"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("performs a power attack if going first", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            });
    });
    it("performs a block if enemy is performing power attack", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "powerAttack",
            enhancements: []
        }))
            .toEqual({
                primary: "block",
                enhancements: []
            });
    });
    it("perform a power attack if enemy is going first and performing a simple attack, none, or block.", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "simpleAttack",
            enhancements: []
        }))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "none",
            enhancements: []
        }))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "block",
            enhancements: []
        }))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            });
    });
    it("perform no action if enemy is going first and performing a dodge.", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "dodge",
            enhancements: []
        }))
            .toEqual({
                primary: "none",
                enhancements: []
            });
    });
});

describe('Tactics overwhelm + dodge', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "dodge"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("performs no action if enemy is dodging", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "dodge",
            enhancements: []
        }))
            .toEqual({
                primary: "none",
                enhancements: []
            });
    });
    it("performs a power attack if enemy is not and cannot dodge or power attack", function () {
        player.combat.stamina = player.combat.maximumStamina;
        enemy.combat.stamina = Decimal.min(calculateActionCost(enemy, {
            primary: "dodge",
            enhancements: []
        }, player), calculateActionCost(enemy, {
            primary: "powerAttack",
            enhancements: []
        }, player)).minus(1);
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            });
    });
    it("performs a dodge if enemy is performing power attack or can perform power attack", function () {
        player.combat.stamina = player.combat.maximumStamina;
        enemy.combat.stamina = enemy.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "dodge",
                enhancements: []
            });
    });
});

describe('Tactics attrit + none', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "attrit",
                defensive: "none"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("if the character has enough energy, they perform a basic attack", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "basicAttack",
                enhancements: []
            });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "simpleAttack"
        })).toEqual({
            primary: "basicAttack",
            enhancements: []
        });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "powerAttack"
        })).toEqual({
            primary: "basicAttack",
            enhancements: []
        });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "none"
        })).toEqual({
            primary: "basicAttack",
            enhancements: []
        });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "blcok"
        })).toEqual({
            primary: "basicAttack",
            enhancements: []
        });
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "dodge"
        })).toEqual({
            primary: "basicAttack",
            enhancements: []
        });
    });
    it("if the character cannot perform a basic attack, they perform a block if they can", function () {
        player.combat.stamina = calculateActionCost(player, {
            primary: "basicAttack",
            enhancements: []
        }, enemy).minus(1);
        expect(determineCharacterCombatAction(player, enemy)).toEqual({
            primary: "block",
            enhancements: []
        });
    });
});

describe('Tactics attrit + block', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "attrit",
                defensive: "block"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("if the enemy is dodging or blocking, perform a basic attack", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "dodge",
            enhancements: []
        }))
            .toEqual({
                primary: "basicAttack",
                enhancements: []
            });
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "block",
            enhancements: []
        }))
            .toEqual({
                primary: "basicAttack",
                enhancements: []
            });
    });
    it("if the enemy is or can power attack, perform a block", function () {
        player.combat.stamina = player.combat.maximumStamina;
        enemy.combat.stamina = enemy.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "powerAttack"
        })).toEqual({
            primary: "block",
            enhancements: []
        });
        expect(determineCharacterCombatAction(player, enemy)).toEqual({
            primary: "block",
            enhancements: []
        });
    });
    it("with no stamina, do nothing", function () {
        player.combat.stamina = Decimal(0);
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "none",
                enhancements: []
            })
    })
});

describe('Tactics attrit + evade', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "attrit",
                defensive: "dodge"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("if the enemy is or can power attack, dodge", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "powerAttack",
            enhancements: []
        }))
            .toEqual({
                primary: "dodge",
                enhancements: []
            });

        enemy.combat.stamina = enemy.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "dodge",
                enhancements: []
            });
    });
    it("if the enemy is or can power attack, perform a dodge", function () {
        player.combat.stamina = player.combat.maximumStamina;
        enemy.combat.stamina = enemy.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, enemy, {
            primary: "powerAttack"
        })).toEqual({
            primary: "dodge",
            enhancements: []
        });
        expect(determineCharacterCombatAction(player, enemy)).toEqual({
            primary: "dodge",
            enhancements: []
        });
    });
    it("with no stamina, do nothing", function () {
        player.combat.stamina = Decimal(0);
        expect(determineCharacterCombatAction(player, enemy))
            .toEqual({
                primary: "none",
                enhancements: []
            });
    });
});