import {Character} from "../../character";
import {CombatActions, DefenseActions} from "../../data/CombatActions";
import {generateTrait, Traits} from "../../data/Traits";
import {Decimal} from "decimal.js";
import triggerEvent from "./triggerEvent";
import calculateDamageBy from "../combat/calculateDamageBy";
import {HitTypes} from "../../data/HitTypes";
import {getConfigurationValue} from "../../config";
import resolveAttack from "../combat/resolveAttack";
import {TraitEffects} from "../../data/TraitEffects";
import {getCharacter} from "../index";
import calculateActionCost from "../combat/actions/calculateActionCost";
import resolveAction from "../combat/actions/resolveAction";
import {resolveCombatRound} from "../combat";
import determineCharacterCombatAction from "../combat/actions/determineCharacterCombatAction";
import {Tactics} from "../../data/Tactics";

jest.mock("../index");

const traitBase = {
    name: "test",
    icon: "icon"
}

describe("acidic effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.acidEffect = generateTrait({...traitBase}, ["acidic"]);
        player = new Character({
            id: 0,
            traits: {
                acidEffect: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("gives an 'acid' attack enhancement ", function () {
        expect(player.attackEnhancements).toContainEqual("acid");
    });
    it("gives acid damage resistance", function () {
        expect(player.damageResistances.acid).toEqual(Decimal(20));
    })
});

describe("arcane effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["arcane"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("gives arcane shield defense enhancement", function () {
        expect(player.defenseEnhancements).toContainEqual("arcane");
    });
    it("blocking with Arcane costs additional stamina", function () {
        expect(calculateActionCost(player, {
            primary: "block",
            enhancements: ["arcane"]
        }, enemy)).toEqual(Decimal(50 * 1.1).floor());
    });
    it("performing block with Arcane shield reduces damage further", function () {
        expect(calculateDamageBy(enemy).using({primary: "basicAttack", enhancements: []})
            .against(player).using({primary: "block", enhancements: ["arcane"]})
        ).toEqual({
            "-1": Decimal(15 * (HitTypes[-1].damageMultiplier) * .85).floor(),
            0: Decimal(15 * (HitTypes[0].damageMultiplier) * .85).floor(),
            1: Decimal(15 * (HitTypes[1].damageMultiplier) * .85).floor(),
            "-2": Decimal(0).floor()
        });
    });
})

describe("bloodthirsty effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["bloodthirsty"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("add stacks of Berserk on hit", function () {
        const roundEvents = [];
        player.combat.stamina = Decimal(200);
        resolveAction(player, {primary: "basicAttack", enhancements: []}, enemy, {
            primary: "none",
            enhancements: []
        }, roundEvents, 100);
        expect(roundEvents).toContainEqual({
            event: "add-status",
            status: "berserk",
            duration: 3,
            stacks: Decimal(1),
            uuid: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            target: 0
        });
        expect(player.statuses).toMatchObject({
            berserk: [
                {
                    source: {
                        character: 0,
                        trait: "test"
                    },
                    stacks: Decimal(1)
                }
            ]
        });
    });
});

describe("cannibal effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["cannibal"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("adds stacks of Engorged on kill", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_kill",
            source: {
                character: player
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "add-status",
            status: "engorged",
            duration: -1,
            stacks: Decimal(TraitEffects.cannibal.on_kill.trigger_effects.add_statuses.engorged.stacks),
            uuid: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            target: 0
        });
        expect(player.statuses).toMatchObject({
            engorged: [
                {
                    source: {
                        character: 0,
                        trait: "test"
                    },
                    stacks: Decimal(TraitEffects.cannibal.on_kill.trigger_effects.add_statuses.engorged.stacks)
                }
            ]
        });
    });
});

describe("coldblooded effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["coldBlooded"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    it("reduces all own action costs", function () {
        expect(calculateActionCost(player, {
            primary: "basicAttack",
            enhancements: []
        })).toEqual(Decimal(100 * CombatActions.basicAttack.energyCostMultiplier * .75).floor())
        expect(calculateActionCost(player, {
            primary: "powerAttack",
            enhancements: []
        })).toEqual(Decimal(100 * CombatActions.powerAttack.energyCostMultiplier * .75).floor())
        expect(calculateActionCost(player, {
            primary: "block",
            enhancements: []
        })).toEqual(Decimal(100 * CombatActions.block.energyCostMultiplier * .75).floor())
        expect(calculateActionCost(player, {
            primary: "dodge",
            enhancements: []
        })).toEqual(Decimal(100 * CombatActions.dodge.energyCostMultiplier * .75).floor())
    });
});

describe("crushing effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["crushing"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("adds stacks of Crushed on solid hit for 2 actions", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_solid_hit",
            source: {
                character: player
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "add-status",
            status: "crushed",
            duration: 2,
            stacks: Decimal(1),
            uuid: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            target: 1
        });
        expect(enemy.statuses).toMatchObject({
            crushed: [
                {
                    source: {
                        character: 0,
                        trait: "test"
                    },
                    stacks: Decimal(1),
                    duration: 2
                }
            ]
        });
    });
    it("adds stacks of Crushed on devastating hit for 5 actions", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_devastating_hit",
            source: {
                character: player
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "add-status",
            status: "crushed",
            duration: 5,
            stacks: Decimal(1),
            uuid: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            target: 1
        });
        expect(enemy.statuses).toMatchObject({
            crushed: [
                {
                    source: {
                        character: 0,
                        trait: "test"
                    },
                    stacks: Decimal(1),
                    duration: 5
                }
            ]
        });
    });
});

describe("diseased effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["diseased"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("adds stacks of diseased to enemy on being hit", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_taking_damage",
            source: {
                character: player,
                attack: {},
                damage: {}
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "add-status",
            status: "infected",
            duration: 999,
            stacks: Decimal(1),
            uuid: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            target: 1
        });
        expect(enemy.statuses).toMatchObject({
            infected: [
                {
                    source: {
                        character: 0,
                        trait: "test"
                    },
                    stacks: Decimal(1),
                    duration: 999
                }
            ]
        });
    });
});

describe("evasive effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["evasive"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        })
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("increases character evasion", function () {
        expect(player.combat.evasion).toEqual(Decimal(1.25));
    })
});

describe("fiery effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["fiery"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        })
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("gives the fire attack enhancement", function () {
        expect(player.attackEnhancements).toContainEqual("flame");
    });
    it("gives fire resistance", function () {
        expect(player.damageResistances).toMatchObject({
            fire: Decimal(.2)
        });
    })
});

describe("flying effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["flying"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("adds a stack of 'untouchable' on dodge", function () {
        const roundEvents = [];
        player.combat.stamina = Decimal(200);
        enemy.combat.stamina = Decimal(200);
        resolveAction(enemy, {
            primary: "basicAttack",
            enhancements: []
        }, player, {
            primary: "dodge",
            enhancements: []
        }, roundEvents, 100)
        expect(player.statuses).toEqual({
            untouchable: [
                {
                    source: {
                        character: 0,
                        trait: "test"
                    },
                    status: "untouchable",
                    uuid: expect.any(String),
                    stacks: Decimal(1),
                    duration: 1
                }
            ]
        });
    });
});

describe("frightening effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["frightening"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("adds stacks of frightened at combat start", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_combat_start",
            source: {
                character: player
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "add-status",
            source: {
                character: 0,
                trait: "test"
            },
            target: 1,
            status: "frightened",
            stacks: Decimal(1),
            uuid: expect.any(String),
            duration: 10
        });
    });
});

describe("grappler effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["grappler"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("add stacks of restrained on solid hit", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_solid_hit",
            source: {
                character: player
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "add-status",
            target: 1,
            source: {
                character: 0,
                trait: "test"
            },
            duration: 2,
            status: "restrained",
            stacks: Decimal(1),
            uuid: expect.any(String)
        });
        expect(enemy.statuses).toMatchObject({
            restrained: [{
                source: {
                    character: 0,
                    trait: "test"
                },
                duration: 2,
                stacks: Decimal(1)
            }]
        })
    });
    it("add stacks of restrained on devastating hit", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_devastating_hit",
            source: {
                character: player
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "add-status",
            target: 1,
            source: {
                character: 0,
                trait: "test"
            },
            duration: 5,
            status: "restrained",
            stacks: Decimal(1),
            uuid: expect.any(String)
        });
        expect(enemy.statuses).toMatchObject({
            restrained: [{
                source: {
                    character: 0,
                    trait: "test"
                },
                duration: 5,
                stacks: Decimal(1)
            }]
        })
    });
});

describe("inscrutable effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["inscrutable"])
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    })
    it("increases precision", function () {
        expect(player.combat.precision).toEqual(Decimal(1.1));
        expect(player.combat.evasion).toEqual(Decimal(1.1));
    });
    it("hides the character's action", function () {
        player.initiative = -50;
        Object.keys(Tactics.offensive).forEach(offensiveTactic => {
            Object.keys(Tactics.defensive).forEach(defensiveTactic => {
                enemy.tactics.offensive = offensiveTactic;
                enemy.tactics.defensive = defensiveTactic;
                expect(determineCharacterCombatAction(enemy, player, {
                    primary: "basicAttack",
                    enhancements: []
                })).toEqual(determineCharacterCombatAction(enemy, player));
            });
        });
    });
});

describe("insubstantial effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["insubstantial"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            },
            tactics: {
                offensive: "attrit",
                defensive: "none"
            }
        });
        enemy = new Character({
            id: 1,
            tactics: {
                offensive: "attrit",
                defensive: "none"
            }
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("reduces the physical damage you deal", function () {
        player.combat.stamina = player.combat.maximumStamina.minus(1);
        const enemyStartingHp = enemy.hp;
        enemy.combat.stamina = enemy.combat.maximumStamina.minus(1);
        resolveAttack(player, {
            primary: "basicAttack",
            enhancements: []
        }, enemy, {
            primary: "none",
            enhancements: []
        }, [], 100);
        expect(enemy.hp).toEqual(Decimal(enemyStartingHp.minus(15 * HitTypes[0].damageMultiplier * .75).ceil()))
    });
});

describe("killer effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        delete Traits.killer;
        Traits.killer = generateTrait({...traitBase}, ["killer"]);
        player = new Character({
            id: 0,
            traits: {
                killer: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    it("increases devastating hit damage", function () {
        const damage = calculateDamageBy(player).using({primary: "powerAttack", enhancements: []})
            .against(enemy).using({primary: "none", enhancements: []});
        expect(damage)
            .toEqual({
                "-2": Decimal(0),
                "-1": Decimal(.75 * 15).floor(),
                0: Decimal(15),
                1: Decimal(15 * 2 * 1.5).floor()
            });
    });
});

describe("large effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["large"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("modifies power, resilience, precision and evasion", function () {
        expect(player.combat.power).toEqual(Decimal(1.2));
        expect(player.combat.resilience).toEqual(Decimal(1.2));
        expect(player.combat.precision).toEqual(Decimal(.9));
        expect(player.combat.evasion).toEqual(Decimal(.9));
    });
});

describe("learned effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["learned"])
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1,
            traits: {
                terrifyingSkitter: 1
            }
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("adds the enemy's traits to your own", function () {
        triggerEvent({
            type: "on_combat_start",
            target: enemy,
            source: {
                character: player
            },
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: []
        });
        expect(player.temporaryTraits.terrifyingSkitter).toEqual(Decimal(1));
    });
});

describe("masochistic effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["masochistic"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("gives energy on taking damage", function () {
        const roundEvents = [];
        enemy.combat.stamina = enemy.combat.maximumStamina.minus(1);
        resolveAction(enemy, {
            primary: "basicAttack",
            enhancements: []
        }, player, {primary: "none", enhancements: []}, roundEvents, 100);
        expect(roundEvents).toContainEqual({
            event: "stamina-change",
            parent: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            uuid: expect.any(String),
            target: 0,
            value: player.combat.maximumStamina.times(0.05).floor()
        });
        expect(player.combat.stamina).toEqual(Decimal(player.combat.maximumStamina.times(0.05).floor()));
    });
});

describe("mindless effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.acidEffect = generateTrait({...traitBase}, ["mindless"]);
        player = new Character({
            id: 0,
            traits: {
                acidEffect: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("gives psychic damage resistance", function () {
        expect(player.damageResistances.psychic).toEqual(Decimal(20));
    });
});

describe("neutralizing effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["neutralizing"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    it("it adds stacks of neutralizing to the demon", function () {
        triggerEvent({
            type: "on_combat_start",
            source: {
                character: player
            },
            combatants: {0: player, 1: enemy},
            roundEvents: []
        });
        expect(player.statuses.neutralizing).toBeDefined();
        expect(player.getStatusStacks("neutralizing")).toEqual(Decimal(3));
    });
    it("it removes stacks of neutralizing from the demon on taking a hit", function () {
        const roundEvents = [];
        player.statuses.neutralizing = [{
            stacks: 1,
            duration: 999,
            source: {
                character: 0,
                trait: "test"
            }
        }];
        triggerEvent({
            type: "on_taking_damage",
            source: {
                character: player
            },
            combatants: {0: player, 1: enemy},
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "remove-status",
            status: "neutralizing",
            target: 0,
            stacks: Decimal(1),
            source: {
                character: 0
            }
        });
        expect(player.statuses.neutralizing).toBeUndefined();
    });
})

describe("venomous effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["venomous"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("adds stacks of Poisoned on hit", function () {
        triggerEvent({
            type: "on_hit",
            source: {
                character: player,
                attack: {
                    action: {
                        enhancements: ["venom"],
                    }
                }
            },
            target: enemy,
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: []
        })
        expect(enemy.statuses).toEqual({
            poisoned: [
                {
                    status: "poisoned",
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        enhancement: "venom"
                    },
                    duration: 5,
                    stacks: Decimal(2)
                }
            ]
        })
    });
});

describe("powerful effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["powerful"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        })
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("increases character power", function () {
        expect(player.combat.power).toEqual(Decimal(1.5));
    })
});

describe("precise effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["precise"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        })
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("increases character precision", function () {
        expect(player.combat.precision).toEqual(Decimal(1.25));
    })
});

describe("regenerative effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["regenerative"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("recovers hp on end of round", function () {
        player.hp = Decimal(1);
        const roundEvents = [];
        player.combat.stamina = player.combat.maximumStamina;
        triggerEvent({
            type: "on_round_end",
            combatants: {
                0: player,
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "health-change",
            parent: undefined,
            value: player.maximumHp.times(0.05).floor(),
            target: 0,
            uuid: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            }
        });
        expect(player.hp).toEqual(Decimal(1).plus(player.maximumHp.times(0.05).floor()));
        expect(player.combat.stamina).toEqual(player.combat.maximumStamina.plus(player.combat.maximumStamina.times(-0.05).floor()));
    });
});

describe("relentless effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["relentless"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        })
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("increases maximum stamina", function () {
        expect(player.combat.maximumStamina).toEqual(Decimal(getConfigurationValue("bonus_stamina_per_level") * 1.25).floor());
    })
    it("increases energy generation", function () {
        expect(player.energyGeneration).toEqual(Decimal(getConfigurationValue("base_power_generated_per_level_per_tick") * 1.25));
    })
});

describe("reversal effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["reversal"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("when the enemy applies a status to the character, the enemy gains a portion of the stacks applied", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_status_applied",
            status: "poisoned",
            stacks: Decimal(10),
            source: {
                character: enemy,
                trait: "test"
            },
            target: player,
            roundEvents,
            combatants: {
                0: player,
                1: enemy
            },
            duration: 5
        });
        expect(roundEvents).toEqual([{
            event: "add-status",
            uuid: expect.any(String),
            source: {
                character: 0,
                trait: "test",
            },
            target: 1,
            status: "poisoned",
            stacks: Decimal(2),
            duration: 5
        }]);
    });
    it("when the player applies a status to the enemy, the trait does not trigger.", function () {
        const roundEvents = [];
        triggerEvent({ // TODO: Methods for generating events.
            type: "on_status_applied",
            status: "poisoned",
            stacks: Decimal(10),
            source: {
                character: player,
                trait: "test"
            },
            target: enemy,
            roundEvents,
            combatants: {
                0: player,
                1: enemy
            },
            duration: 5
        });
        expect(roundEvents).toEqual([]);
    });
    it("when the enemy applies a status to their self, the trait does not trigger.", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_status_applied",
            status: "poisoned",
            stacks: Decimal(10),
            source: {
                character: enemy,
                trait: "test"
            },
            target: enemy,
            roundEvents,
            combatants: {
                0: player,
                1: enemy
            },
            duration: 5
        });
        expect(roundEvents).toEqual([]);
    });
});

describe("robust effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["robust"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
    });
    it("increases maximum hp", function () {
        expect(player.maximumHp).toEqual(Decimal(50 * 1.6).floor());
    })
});

describe("sadistic effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["sadistic"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("gives energy on hit", function () {
        const roundEvents = [];
        player.combat.stamina = player.combat.maximumStamina.minus(1);
        resolveAction(player, {
            primary: "basicAttack",
            enhancements: []
        }, enemy, {primary: "none", enhancements: []}, roundEvents, 100);
        expect(roundEvents).toContainEqual({
            event: "stamina-change",
            parent: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            uuid: expect.any(String),
            target: 0,
            value: player.combat.maximumStamina.times(0.05).floor()
        });
        expect(player.combat.stamina).toEqual(player.combat.maximumStamina.minus(1 + Math.floor(100 * CombatActions.basicAttack.energyCostMultiplier * .85)).plus(player.combat.maximumStamina.times(0.05).floor()));
    });
});

describe("swarming effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["swarming"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("inflicts damage at end of round", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_round_end",
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents
        });
        expect(roundEvents).toContainEqual({
            event: "health-change",
            source: {
                character: 0,
                trait: "test"
            },
            value: Decimal(5),
            target: 1,
            uuid: expect.any(String),
            parent: undefined
        });
    });
});

describe("small effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["small"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("modifies power, resilience, precision and evasion", function () {
        expect(player.combat.power).toEqual(Decimal(.9));
        expect(player.combat.resilience).toEqual(Decimal(.9));
        expect(player.combat.precision).toEqual(Decimal(1.2));
        expect(player.combat.evasion).toEqual(Decimal(1.2));
    });
});

describe("suffocating effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["small"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("inflicts stacks of fatigue on hit", function () {
        player.combat.stamina = Decimal(150);
        resolveAction(player, {primary: "basicAttack", enhancements: ["exhausting"]}, enemy, {
            primary: "none", enhancements: []
        }, [], 100);
        expect(enemy.combat.fatigue).toEqual(Decimal(3));
    })
});

describe("thorns effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["thorns"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
        enemy = new Character({
            id: 1
        });
        getCharacter.mockImplementation((id) => {
            if (id === player.id) {
                return player;
            } else if (id === enemy.id) {
                return enemy;
            }
        })
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("reflects damage", function () {
        const roundEvents = [];
        enemy.combat.stamina = Decimal(200);
        resolveAction(enemy, {
            primary: "basicAttack",
            enhancements: []
        }, player, {
            primary: "none",
            enhancements: []
        }, roundEvents, 100);
        expect(roundEvents).toContainEqual({
            event: "damage",
            source: {
                character: 0,
                trait: "test"
            },
            type: "psychic",
            target: 1,
            uuid: expect.any(String),
            value: Decimal(3)
        })
    });
});

describe("tough effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["tough"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("increases character resilience", function () {
        expect(player.combat.resilience).toEqual(Decimal(1.25));
    })
});

describe("unstoppable effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({...traitBase}, ["unstoppable"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        });
        enemy = new Character({
            id: 1
        });
    });
    afterEach(() => {
        delete Traits.test;
    });
    it("increases energy cost to block your attacks", function () {
        const blockCost = calculateActionCost(enemy, {primary: "block", enhancements: []}, player);
        expect(blockCost).toEqual(Decimal(100 * 1.1 * .5).floor());
    });
});