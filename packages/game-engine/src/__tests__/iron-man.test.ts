import { describe, it, expect } from "vitest";
import { HeroCard, Scheme, Mastermind, Tactic } from "../index.js";
import {
  IronManBlazingRepulsor,
  IronManInvincibleArmor,
  IronManExothermicBlast,
  IronManThinkSmarter,
  IronManThinkingCap,
} from "../heroes/iron-man.js";
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

describe("IronManBlazingRepulsor", () => {
  it("is a HeroCard", () => { expect(new IronManBlazingRepulsor()).toBeInstanceOf(HeroCard); });
  it("onPlay adds 4 attack", () => {
    const c = new IronManBlazingRepulsor();
    const next = c.onPlay(makeState());
    expect(next.player.attackPoints).toBe(4);
  });
});

describe("IronManInvincibleArmor", () => {
  it("onPlay adds 2 attack and 1 recruit", () => {
    const c = new IronManInvincibleArmor();
    const next = c.onPlay(makeState());
    expect(next.player.attackPoints).toBe(2);
    expect(next.player.recruitPoints).toBe(1);
  });
  it("team bonus: adds 2 more attack when another Iron Man played", () => {
    const c = new IronManInvincibleArmor();
    const state = stateWithPlayed([new IronManBlazingRepulsor()]);
    const next = c.onPlay(state);
    expect(next.player.attackPoints).toBe(4); // 2 base + 2 bonus
  });
});

describe("IronManExothermicBlast", () => {
  it("onPlay adds 5 attack", () => {
    const c = new IronManExothermicBlast();
    const next = c.onPlay(makeState());
    expect(next.player.attackPoints).toBe(5);
  });
});

describe("IronManThinkSmarter", () => {
  it("onPlay adds 3 recruit", () => {
    const c = new IronManThinkSmarter();
    const next = c.onPlay(makeState());
    expect(next.player.recruitPoints).toBe(3);
  });
});

describe("IronManThinkingCap", () => {
  it("onPlay adds 5 recruit", () => {
    const c = new IronManThinkingCap();
    const next = c.onPlay(makeState());
    expect(next.player.recruitPoints).toBe(5);
  });
  it("team bonus: adds 2 more recruit when another Iron Man played", () => {
    const c = new IronManThinkingCap();
    const state = stateWithPlayed([new IronManBlazingRepulsor()]);
    const next = c.onPlay(state);
    expect(next.player.recruitPoints).toBe(7); // 5 base + 2 bonus
  });
  it("no team bonus without other Iron Man cards played", () => {
    const c = new IronManThinkingCap();
    const next = c.onPlay(makeState());
    expect(next.player.recruitPoints).toBe(5);
  });
});
