import { describe, it, expect } from "vitest";
import { HeroCard, Scheme, Mastermind, Tactic, Wound } from "../index.js";
import {
  WolverineAdamantiumClaws,
  WolverineAdamantiumSkeleton,
  WolverineHealingFactor,
  WolverineUndying,
  WolverineBerserkerRage,
} from "../heroes/wolverine.js";
import type { GameState } from "../index.js";

class NoopTactic extends Tactic {
  onDefeat(s: GameState): GameState { return s; }
}
class NoopScheme extends Scheme {}

function makeState(overrides?: Partial<GameState>): GameState {
  return {
    phase: "VILLAIN_DECK_FLIP",
    scheme: new NoopScheme("s1", "Scheme"),
    mastermind: new Mastermind("mm1", "MM", [new NoopTactic("t1", "T1")]),
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

function stateWithPlayed(cards: HeroCard[]): GameState {
  return makeState({ player: { ...makeState().player, playedThisTurn: cards } });
}

describe("WolverineAdamantiumClaws", () => {
  it("is a HeroCard", () => { expect(new WolverineAdamantiumClaws()).toBeInstanceOf(HeroCard); });
  it("onPlay adds 5 attack", () => {
    expect(new WolverineAdamantiumClaws().onPlay(makeState()).player.attackPoints).toBe(5);
  });
});

describe("WolverineAdamantiumSkeleton", () => {
  it("onPlay adds 3 attack", () => {
    expect(new WolverineAdamantiumSkeleton().onPlay(makeState()).player.attackPoints).toBe(3);
  });
  it("team bonus: adds 2 more attack when another Wolverine played", () => {
    const state = stateWithPlayed([new WolverineAdamantiumClaws()]);
    expect(new WolverineAdamantiumSkeleton().onPlay(state).player.attackPoints).toBe(5);
  });
});

describe("WolverineHealingFactor", () => {
  it("onPlay adds 2 attack and 1 recruit", () => {
    const next = new WolverineHealingFactor().onPlay(makeState());
    expect(next.player.attackPoints).toBe(2);
    expect(next.player.recruitPoints).toBe(1);
  });
  it("team bonus: removes first wound from player.hand when another Wolverine played", () => {
    const wound = new Wound("w1");
    const state = stateWithPlayed([new WolverineAdamantiumClaws()]);
    const stateWithWound = { ...state, player: { ...state.player, hand: [wound] } };
    const next = new WolverineHealingFactor().onPlay(stateWithWound);
    expect(next.player.hand).toHaveLength(0);
  });
  it("team bonus with no wound in hand: hand unchanged", () => {
    const state = stateWithPlayed([new WolverineAdamantiumClaws()]);
    const next = new WolverineHealingFactor().onPlay(state);
    expect(next.player.hand).toHaveLength(0);
  });
});

describe("WolverineUndying", () => {
  it("onPlay adds 3 attack", () => {
    expect(new WolverineUndying().onPlay(makeState()).player.attackPoints).toBe(3);
  });
});

describe("WolverineBerserkerRage", () => {
  it("onPlay adds 4 attack and 1 recruit", () => {
    const next = new WolverineBerserkerRage().onPlay(makeState());
    expect(next.player.attackPoints).toBe(4);
    expect(next.player.recruitPoints).toBe(1);
  });
});
