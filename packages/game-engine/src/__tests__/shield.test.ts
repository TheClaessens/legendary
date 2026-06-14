import { describe, it, expect } from "vitest";
import { HeroCard, Scheme, Mastermind, Tactic } from "../index.js";
import { ShieldAgent, ShieldTrooper } from "../heroes/shield.js";
import type { GameState } from "../index.js";

class NoopTactic extends Tactic {
  onDefeat(s: GameState): GameState { return s; }
}
class NoopScheme extends Scheme {}

function makeState(): GameState {
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
    player: { deck: [], hand: [], discard: [], victory: [], playedThisTurn: [], recruitPoints: 0, attackPoints: 0 },
  };
}

describe("ShieldAgent", () => {
  it("is a HeroCard", () => { expect(new ShieldAgent("a1")).toBeInstanceOf(HeroCard); });
  it("onPlay adds 1 recruit", () => {
    const next = new ShieldAgent("a1").onPlay(makeState());
    expect(next.player.recruitPoints).toBe(1);
    expect(next.player.attackPoints).toBe(0);
  });
});

describe("ShieldTrooper", () => {
  it("is a HeroCard", () => { expect(new ShieldTrooper("t1")).toBeInstanceOf(HeroCard); });
  it("onPlay adds 1 attack", () => {
    const next = new ShieldTrooper("t1").onPlay(makeState());
    expect(next.player.attackPoints).toBe(1);
    expect(next.player.recruitPoints).toBe(0);
  });
});
