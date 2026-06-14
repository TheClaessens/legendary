import { describe, it, expect } from "vitest";
import { Scheme, Mastermind, Tactic } from "../index.js";
import { CosmicCubeScheme } from "../schemes/cosmic-cube.js";
import type { GameState } from "../index.js";

class NoopTactic extends Tactic {
  onDefeat(state: GameState): GameState {
    return state;
  }
}

function makeState(overrides?: Partial<GameState>): GameState {
  const scheme = new CosmicCubeScheme();
  const tactic1 = new NoopTactic("t1", "Tactic 1");
  const tactic2 = new NoopTactic("t2", "Tactic 2");
  const mastermind = new Mastermind("mm1", "Red Skull", [tactic1, tactic2]);
  return {
    phase: "VILLAIN_DECK_FLIP",
    status: "IN_PROGRESS",
    scheme,
    mastermind,
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

describe("CosmicCubeScheme", () => {
  it("is a Scheme", () => {
    expect(new CosmicCubeScheme()).toBeInstanceOf(Scheme);
  });
});

describe("CosmicCubeScheme.onSchemeTwist", () => {
  it("increments schemeTwistCount", () => {
    const scheme = new CosmicCubeScheme();
    const state = makeState({ schemeTwistCount: 2 });
    const next = scheme.onSchemeTwist(state);
    expect(next.schemeTwistCount).toBe(3);
  });

  it("does not mutate original state", () => {
    const scheme = new CosmicCubeScheme();
    const state = makeState({ schemeTwistCount: 1 });
    scheme.onSchemeTwist(state);
    expect(state.schemeTwistCount).toBe(1);
  });
});

describe("CosmicCubeScheme.checkLoseCondition", () => {
  it("returns false when twistCount < 5", () => {
    const scheme = new CosmicCubeScheme();
    expect(scheme.checkLoseCondition(makeState({ schemeTwistCount: 4 }))).toBe(false);
  });

  it("returns true when twistCount reaches 5", () => {
    const scheme = new CosmicCubeScheme();
    expect(scheme.checkLoseCondition(makeState({ schemeTwistCount: 5 }))).toBe(true);
  });

  it("returns true when twistCount exceeds 5", () => {
    const scheme = new CosmicCubeScheme();
    expect(scheme.checkLoseCondition(makeState({ schemeTwistCount: 7 }))).toBe(true);
  });
});

describe("CosmicCubeScheme.checkWinCondition", () => {
  it("returns false when no tactics are defeated", () => {
    const scheme = new CosmicCubeScheme();
    expect(scheme.checkWinCondition(makeState())).toBe(false);
  });

  it("returns false when only some tactics are defeated", () => {
    const scheme = new CosmicCubeScheme();
    const state = makeState();
    const partialVictory = { ...state, player: { ...state.player, victory: [state.mastermind.tactics[0]] } };
    expect(scheme.checkWinCondition(partialVictory)).toBe(false);
  });

  it("returns true when all tactics are in player.victory", () => {
    const scheme = new CosmicCubeScheme();
    const state = makeState();
    const allDefeated = { ...state, player: { ...state.player, victory: [...state.mastermind.tactics] } };
    expect(scheme.checkWinCondition(allDefeated)).toBe(true);
  });
});
