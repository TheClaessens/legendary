import { describe, it, expect } from "vitest";
import type { GameState } from "../base.js";
import { Mastermind } from "../base.js";
import { CosmicCubeScheme } from "../schemes/cosmic-cube.js";
import { RedSkull } from "../mastermind/red-skull.js";
import { ShieldAgent } from "../heroes/shield.js";
import { IronManBlazingRepulsor } from "../heroes/iron-man.js";
import { HydraSoldier } from "../villains/hydra.js";
import { recruitHero, fightVillain, fightMastermind } from "../game-actions.js";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: "MAIN",
    status: "IN_PROGRESS",
    scheme: new CosmicCubeScheme(),
    mastermind: new RedSkull(),
    city: [null, null, null, null, null],
    sewers: [],
    heroDeck: [],
    hq: [null, null, null, null, null],
    villainDeck: [],
    koPile: [],
    schemeTwistCount: 0,
    player: {
      deck: [],
      hand: [],
      discard: [],
      victory: [],
      playedThisTurn: [],
      recruitPoints: 0,
      attackPoints: 0,
    },
    ...overrides,
  };
}

describe("recruitHero", () => {
  it("throws when phase is not MAIN", () => {
    const hero = new IronManBlazingRepulsor();
    const state = makeState({ phase: "VILLAIN_DECK_FLIP", hq: [hero, null, null, null, null], player: { ...makeState().player, recruitPoints: 10 } });
    expect(() => recruitHero(state, 0)).toThrow();
  });

  it("throws when HQ slot is empty", () => {
    const state = makeState({ player: { ...makeState().player, recruitPoints: 10 } });
    expect(() => recruitHero(state, 0)).toThrow();
  });

  it("throws when insufficient recruit points", () => {
    const hero = new IronManBlazingRepulsor(); // cost 4
    const state = makeState({ hq: [hero, null, null, null, null], player: { ...makeState().player, recruitPoints: 3 } });
    expect(() => recruitHero(state, 0)).toThrow();
  });

  it("moves hero from HQ to player.discard", () => {
    const hero = new IronManBlazingRepulsor(); // cost 4
    const state = makeState({ hq: [hero, null, null, null, null], player: { ...makeState().player, recruitPoints: 5 } });

    const result = recruitHero(state, 0);

    expect(result.hq[0]).toBeNull();
    expect(result.player.discard).toContain(hero);
  });

  it("deducts recruit points equal to card cost", () => {
    const hero = new IronManBlazingRepulsor(); // cost 4
    const state = makeState({ hq: [hero, null, null, null, null], player: { ...makeState().player, recruitPoints: 5 } });

    const result = recruitHero(state, 0);

    expect(result.player.recruitPoints).toBe(1);
  });

  it("draws top of heroDeck to refill HQ slot", () => {
    const hero = new IronManBlazingRepulsor(); // cost 4
    const refill = new ShieldAgent("agent-0");
    const state = makeState({
      hq: [hero, null, null, null, null],
      heroDeck: [refill],
      player: { ...makeState().player, recruitPoints: 5 },
    });

    const result = recruitHero(state, 0);

    expect(result.hq[0]).toBe(refill);
    expect(result.heroDeck).toHaveLength(0);
  });

  it("leaves HQ slot null when heroDeck is empty", () => {
    const hero = new IronManBlazingRepulsor();
    const state = makeState({ hq: [hero, null, null, null, null], heroDeck: [], player: { ...makeState().player, recruitPoints: 5 } });

    const result = recruitHero(state, 0);

    expect(result.hq[0]).toBeNull();
    expect(result.heroDeck).toHaveLength(0);
  });
});

describe("fightVillain", () => {
  it("throws when phase is not MAIN", () => {
    const villain = new HydraSoldier(); // attackValue 3
    const state = makeState({ phase: "VILLAIN_DECK_FLIP", city: [villain, null, null, null, null], player: { ...makeState().player, attackPoints: 5 } });
    expect(() => fightVillain(state, 0)).toThrow();
  });

  it("throws when city slot is empty", () => {
    const state = makeState({ player: { ...makeState().player, attackPoints: 5 } });
    expect(() => fightVillain(state, 0)).toThrow();
  });

  it("throws when insufficient attack points", () => {
    const villain = new HydraSoldier(); // attackValue 3
    const state = makeState({ city: [villain, null, null, null, null], player: { ...makeState().player, attackPoints: 2 } });
    expect(() => fightVillain(state, 0)).toThrow();
  });

  it("removes villain from city", () => {
    const villain = new HydraSoldier(); // attackValue 3
    const state = makeState({ city: [villain, null, null, null, null], player: { ...makeState().player, attackPoints: 5 } });

    const result = fightVillain(state, 0);

    expect(result.city[0]).toBeNull();
  });

  it("moves villain to player.victory", () => {
    const villain = new HydraSoldier(); // attackValue 3
    const state = makeState({ city: [villain, null, null, null, null], player: { ...makeState().player, attackPoints: 5 } });

    const result = fightVillain(state, 0);

    expect(result.player.victory).toContain(villain);
  });

  it("deducts attack points equal to villain attackValue", () => {
    const villain = new HydraSoldier(); // attackValue 3
    const state = makeState({ city: [villain, null, null, null, null], player: { ...makeState().player, attackPoints: 5 } });

    const result = fightVillain(state, 0);

    expect(result.player.attackPoints).toBe(2);
  });
});

describe("fightMastermind", () => {
  it("throws when phase is not MAIN", () => {
    const state = makeState({ phase: "VILLAIN_DECK_FLIP", player: { ...makeState().player, attackPoints: 20 } });
    expect(() => fightMastermind(state)).toThrow();
  });

  it("throws when insufficient attack points", () => {
    const state = makeState({ player: { ...makeState().player, attackPoints: 5 } }); // RedSkull attackValue 10
    expect(() => fightMastermind(state)).toThrow();
  });

  it("moves first undefeated tactic to player.victory", () => {
    const mastermind = new RedSkull();
    const firstTactic = mastermind.tactics[0];
    const state = makeState({ mastermind, player: { ...makeState().player, attackPoints: 15 } });

    const result = fightMastermind(state);

    expect(result.player.victory).toContain(firstTactic);
  });

  it("deducts attack points equal to mastermind attackValue", () => {
    const mastermind = new RedSkull(); // attackValue 10
    const [t1] = mastermind.tactics; // defeat t1 (TacticCosmicCubePower) so t2 is next
    const state = makeState({ mastermind, player: { ...makeState().player, attackPoints: 15, victory: [t1] } });

    const result = fightMastermind(state);

    expect(result.player.attackPoints).toBe(5); // t2 = TacticHydraTroops, doesn't reduce attackPoints
  });

  it("marks game as WON when all tactics defeated", () => {
    const mastermind = new RedSkull();
    const [t1, t2, t3] = mastermind.tactics;
    const state = makeState({
      mastermind,
      player: {
        ...makeState().player,
        attackPoints: 100,
        victory: [t1, t2, t3],
      },
    });

    const result = fightMastermind(state);

    expect(result.status).toBe("WON");
  });

  it("keeps status IN_PROGRESS when tactics remain after fight", () => {
    const mastermind = new RedSkull();
    const state = makeState({ mastermind, player: { ...makeState().player, attackPoints: 15 } });

    const result = fightMastermind(state);

    expect(result.status).toBe("IN_PROGRESS");
  });

  it("skips already-defeated tactics", () => {
    const mastermind = new RedSkull();
    const [t1, t2] = mastermind.tactics;
    const state = makeState({
      mastermind,
      player: {
        ...makeState().player,
        attackPoints: 15,
        victory: [t1],
      },
    });

    const result = fightMastermind(state);

    expect(result.player.victory).toContain(t2);
    expect(result.player.victory).toContain(t1);
  });
});
