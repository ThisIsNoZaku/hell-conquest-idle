import {Character} from "../../character";
import {AttackActions, DefenseActions} from "../../data/CombatActions";
import {generateTrait, Traits} from "../../data/Traits";
import {Decimal} from "decimal.js";
import resolveCombatRound from "../combat/resolveCombatRound";
import resolveAction from "../combat/actions/resolveAction";
import triggerEvent from "./triggerEvent";
import calculateDamageBy from "../combat/calculateDamageBy";
import calculateReactionCost from "../combat/actions/calculateReactionCost";

jest.mock("../index");

describe("acidic effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.acidEffect = generateTrait({}, ["acidic"]);
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
    it("gives an 'acid' attack enhancement ", function () {
        expect(player.attackEnhancements).toContainEqual({
            change_damage_type: "acid",
            energy_cost_multiplier: 2
        });
    });
    it("gives acid damage resistance", function () {
        expect(player.damageResistances.acid).toEqual(Decimal(20));
    })
});

describe("arcane effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["arcane"]);
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
    it("gives arcane shield defense enhancement", function () {
        expect(player.defenseEnhancements).toContain("arcaneShield");
    });
    it("performing block with Arcane shield costs additional stamina and reduces damage further", function () {
        const roundEvents = [];
        player.combat.stamina = Decimal(1000);
        resolveAction(player, {0: player, 1: enemy}, roundEvents, 100);

    });
})

describe("bloodthirsty effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["bloodthirsty"]);
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
    it("add stacks of Berserk on hit", function () {
        const roundEvents = [];
        player.combat.stamina = Decimal(100);
        resolveAction(player, {0: player, 1: enemy}, roundEvents, 100);
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
        Traits.test = generateTrait({}, ["cannibal"]);
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
            stacks: Decimal(1),
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
                    stacks: Decimal(1)
                }
            ]
        });
    });
});

describe("crushing effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["crushing"]);
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
        Traits.test = generateTrait({}, ["diseased"]);
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
        Traits.test = generateTrait({}, ["evasive"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        })
    })
    it("increases character evasion", function () {
        expect(player.combat.evasion).toEqual(Decimal(1.4));
    })
});

describe("fiery effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["fiery"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        })
    })
    it("gives the fire attack enhancement", function () {
        expect(player.attackEnhancements).toContainEqual({
            energy_cost_multiplier: 2,
            change_damage_type: "fire"
        });
    });
    it("gives fire resistance", function () {
        expect(player.damageResistances).toMatchObject({
            fire: Decimal(.2)
        });
    })
})

describe("frightening effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["frightening"]);
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
        Traits.test = generateTrait({}, ["grappler"]);
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

describe("insubstantial effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["insubstantial"]);
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
    it("reduces the physical damage you deal and take", function () {
        const playerStartingHp = player.hp;
        player.combat.stamina = player.combat.maximumStamina;
        const enemyStartingHp = enemy.hp;
        enemy.combat.stamina = enemy.combat.maximumStamina.minus(1);
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(player.hp).toEqual(Decimal(playerStartingHp.minus(11).floor()))
        expect(enemy.hp).toEqual(Decimal(enemyStartingHp.minus(11).floor()))
    });
});

describe("killer effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["killer"]);
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
    it("increases devastating hit damage", function () {
        const damage = calculateDamageBy(player).against(enemy);
        expect(damage)
            .toEqual({
                "-2": Decimal(0),
                "-1": Decimal(.33 * 15).floor(),
                0: Decimal(15),
                1: Decimal(33).floor()
            })
    });
});

describe("large effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["large"]);
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
        Traits.test = generateTrait({}, ["learned"])
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

describe("mindless effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.acidEffect = generateTrait({}, ["mindless"]);
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
    it("gives psychic damage resistance", function () {
        expect(player.damageResistances.psychic).toEqual(Decimal(20));
    });
});

describe("venomous effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["venomous"]);
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
    it("adds stacks of Poisoned on devastating hit", function () {
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
            roundEvents: []
        })
        expect(enemy.statuses).toEqual({
            poisoned: [
                {
                    status: "poisoned",
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        trait: "test"
                    },
                    duration: 5,
                    stacks: Decimal(1)
                }
            ]
        })
    });
});

describe("powerful effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["powerful"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        })
    })
    it("increases character power", function () {
        expect(player.combat.power).toEqual(Decimal(1.5));
    })
});

describe("precise effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["precise"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        })
    })
    it("increases character precision", function () {
        expect(player.combat.precision).toEqual(Decimal(1.25));
    })
});

describe("regenerative effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["regenerative"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        });
    })
    it("recovers hp on end of round", function () {
        player.hp = Decimal(1);
        const roundEvents = [];
        player.combat.stamina = player.combat.maximumStamina;
        triggerEvent({
            type: "on_round_end",
            combatants: {
                0: player,
            },
            source: {
                character: player,
            },
            target: player,
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
        expect(player.combat.stamina).toEqual(player.combat.maximumStamina.minus(player.combat.maximumStamina.times(0.05).floor()));
    });
});

describe("relentless effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["relentless"]);
        player = new Character({
            id: 0,
            traits: {
                test: 1
            }
        })
    });
    it("increases maximum stamina", function () {
        expect(player.combat.maximumStamina).toEqual(Decimal(250));
    })
    it("increases energy generation", function () {
        expect(player.energyGeneration).toEqual(Decimal(.5 * 1.25));
    })
});

describe("robust effect", function () {
    let player;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["robust"]);
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
        Traits.test = generateTrait({}, ["sadistic"]);
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
    it("gives energy on hit", function () {
        const roundEvents = [];
        player.combat.stamina = player.combat.maximumStamina;
        resolveAction(player, {0: player, 1: enemy},  roundEvents, 100);
        expect(roundEvents).toContainEqual({
            event: "stamina-change",
            parent: expect.any(String),
            source: {
                character: 0,
                trait: "test"
            },
            uuid: expect.any(String),
            target: 0,
            value: player.combat.maximumStamina.times(0.05)
        });
        expect(player.combat.stamina).toEqual(player.combat.maximumStamina.minus(22).plus(player.combat.maximumStamina.times(0.05)));
    });
});

describe("swarming effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["swarming"]);
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
    it("inflicts damage at end of round", function () {
        const roundEvents = [];
        triggerEvent({
            type: "on_round_end",
            combatants: {
                0: player,
                1: enemy
            },
            source : {
                character: player
            },
            target: player,
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
        Traits.test = generateTrait({}, ["small"]);
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
    it("modifies power, resilience, precision and evasion", function () {
        expect(player.combat.power).toEqual(Decimal(.9));
        expect(player.combat.resilience).toEqual(Decimal(.9));
        expect(player.combat.precision).toEqual(Decimal(1.2));
        expect(player.combat.evasion).toEqual(Decimal(1.2));
    });
});

describe("thorns effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["thorns"]);
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
    it("reflects damage", function () {
        const roundEvents = [];
        enemy.combat.stamina = Decimal(100);
        resolveAction(enemy, {0: player, 1: enemy}, roundEvents, 100);
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
        Traits.test = generateTrait({}, ["tough"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        })
    })
    it("increases character resilience", function () {
        expect(player.combat.resilience).toEqual(Decimal(1.25));
    })
});

describe("unstoppable effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        Traits.test = generateTrait({}, ["unstoppable"]);
        player = new Character({
            id: 0,
            traits: {test: 1}
        });
        enemy = new Character({
            id: 1
        });
    })
    it("increases energy cost to block your attacks", function () {
        const blockCost = calculateReactionCost(player, {primary:"block", enhancements: []}, player);
        expect(blockCost).toEqual(Decimal(25 * 1.15).floor());
    })
});