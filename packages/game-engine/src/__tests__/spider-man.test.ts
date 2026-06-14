import { describe, it, expect } from "vitest";
import { HeroCard, Scheme, Mastermind, Tactic } from "../index.js";
import {
  SpiderManAgileDefense,
  SpiderManWebSwing,
  SpiderManAmazingFantasy,
  SpiderManWallCrawling,
  SpiderManSpiderSense,
} from "../heroes/spider-man.js";
import type { GameState } from "../index.js";

class NoopTactic extends Tactic {
  onDefeat(s: GameState): GameState { return s; }
}
class NoopScheme extends Scheme {}

function makeState(overrides?: Partial<GameState>): GameState {
  return {
    phase: "VILLAIN_DECK_FLIP",
    status: "IN_PROGRESS",
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

describe("SpiderManAgileDefense", () => {
  it("is a HeroCard", () => { expect(new SpiderManAgileDefense()).toBeInstanceOf(HeroCard); });
  it("onPlay adds 2 attack and 1 recruit", () => {
    const c = new SpiderManAgileDefense();
    const next = c.onPlay(makeState());
    expect(next.player.attackPoints).toBe(2);
    expect(next.player.recruitPoints).toBe(1);
  });
});

describe("SpiderManWebSwing", () => {
  it("onPlay adds 3 attack", () => {
    const c = new SpiderManWebSwing();
    const next = c.onPlay(makeState());
    expect(next.player.attackPoints).toBe(3);
  });
  it("team bonus: adds 3 recruit when another Spider-Man played", () => {
    const c = new SpiderManWebSwing();
    const state = stateWithPlayed([new SpiderManAgileDefense()]);
    const next = c.onPlay(state);
    expect(next.player.recruitPoints).toBe(3);
  });
  it("no team bonus without another Spider-Man played", () => {
    const c = new SpiderManWebSwing();
    expect(c.onPlay(makeState()).player.recruitPoints).toBe(0);
  });
});

describe("SpiderManAmazingFantasy", () => {
  it("onPlay adds 4 recruit", () => {
    const c = new SpiderManAmazingFantasy();
    const next = c.onPlay(makeState());
    expect(next.player.recruitPoints).toBe(4);
  });
});

describe("SpiderManWallCrawling", () => {
  it("onPlay adds 3 attack", () => {
    const c = new SpiderManWallCrawling();
    const next = c.onPlay(makeState());
    expect(next.player.attackPoints).toBe(3);
  });
});

describe("SpiderManSpiderSense", () => {
  it("onPlay adds 2 recruit", () => {
    const c = new SpiderManSpiderSense();
    const next = c.onPlay(makeState());
    expect(next.player.recruitPoints).toBe(2);
  });
  it("team bonus: adds 2 attack when another Spider-Man played", () => {
    const c = new SpiderManSpiderSense();
    const state = stateWithPlayed([new SpiderManAgileDefense()]);
    const next = c.onPlay(state);
    expect(next.player.attackPoints).toBe(2);
  });
  it("no team bonus without another Spider-Man played", () => {
    const c = new SpiderManSpiderSense();
    expect(c.onPlay(makeState()).player.attackPoints).toBe(0);
  });
});
