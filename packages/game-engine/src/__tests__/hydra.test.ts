import { describe, it, expect } from "vitest";
import {
  Scheme,
  Mastermind,
  Tactic,
  HeroCard,
  Villain,
  Wound,
} from "../index.js";
import {
  BaronStrucker,
  HydraSoldier,
  HydraAssassin,
  MadameHydra,
} from "../villains/hydra.js";
import type { GameState } from "../index.js";

// ── Stubs ────────────────────────────────────────────────────────────────────

class NoopScheme extends Scheme {
  escapeCalled = false;
  onVillainEscape(state: GameState): GameState {
    this.escapeCalled = true;
    return state;
  }
}

class NoopTactic extends Tactic {
  onDefeat(state: GameState): GameState {
    return state;
  }
}

function makeState(overrides?: Partial<GameState>): GameState {
  const scheme = new NoopScheme("s1", "Cosmic Cube");
  const tactic = new NoopTactic("t0", "Noop");
  const mastermind = new Mastermind("mm1", "Red Skull", [tactic]);
  return {
    phase: "VILLAIN_DECK_FLIP",
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
      deck: [{ id: "c1", name: "Card 1" }, { id: "c2", name: "Card 2" }],
      hand: [],
      discard: [],
      victory: [],
      recruitPoints: 3,
      attackPoints: 5,
    },
    ...overrides,
  };
}

// ── BaronStrucker ─────────────────────────────────────────────────────────────

describe("BaronStrucker", () => {
  it("is a Villain with correct stats", () => {
    const v = new BaronStrucker();
    expect(v).toBeInstanceOf(Villain);
    expect(v.attackValue).toBe(7);
    expect(v.vpValue).toBe(4);
  });

  it("onAmbush adds a Wound to player.discard", () => {
    const v = new BaronStrucker();
    const state = makeState();
    const next = v.onAmbush(state);
    expect(next.player.discard).toHaveLength(1);
    expect(next.player.discard[0]).toBeInstanceOf(Wound);
  });

  it("onEscape returns state unchanged", () => {
    const v = new BaronStrucker();
    const state = makeState();
    expect(v.onEscape(state)).toBe(state);
  });

  it("onFight returns state unchanged", () => {
    const v = new BaronStrucker();
    const state = makeState();
    expect(v.onFight(state)).toBe(state);
  });
});

// ── HydraSoldier ─────────────────────────────────────────────────────────────

describe("HydraSoldier", () => {
  it("is a Villain with correct stats", () => {
    const v = new HydraSoldier();
    expect(v).toBeInstanceOf(Villain);
    expect(v.attackValue).toBe(3);
    expect(v.vpValue).toBe(1);
  });

  it("all hooks return state unchanged", () => {
    const v = new HydraSoldier();
    const state = makeState();
    expect(v.onAmbush(state)).toBe(state);
    expect(v.onEscape(state)).toBe(state);
    expect(v.onFight(state)).toBe(state);
  });
});

// ── HydraAssassin ─────────────────────────────────────────────────────────────

describe("HydraAssassin", () => {
  it("is a Villain with correct stats", () => {
    const v = new HydraAssassin();
    expect(v).toBeInstanceOf(Villain);
    expect(v.attackValue).toBe(4);
    expect(v.vpValue).toBe(2);
  });

  it("onFight moves top of player.deck to player.discard", () => {
    const v = new HydraAssassin();
    const state = makeState();
    const topCard = state.player.deck[0];
    const next = v.onFight(state);
    expect(next.player.deck).toHaveLength(1);
    expect(next.player.discard).toHaveLength(1);
    expect(next.player.discard[0]).toBe(topCard);
  });

  it("onFight with empty deck returns state unchanged", () => {
    const v = new HydraAssassin();
    const state = makeState({ player: { ...makeState().player, deck: [] } });
    const next = v.onFight(state);
    expect(next.player.discard).toHaveLength(0);
  });

  it("onAmbush returns state unchanged", () => {
    const v = new HydraAssassin();
    const state = makeState();
    expect(v.onAmbush(state)).toBe(state);
  });
});

// ── MadameHydra ───────────────────────────────────────────────────────────────

describe("MadameHydra", () => {
  it("is a Villain with correct stats", () => {
    const v = new MadameHydra();
    expect(v).toBeInstanceOf(Villain);
    expect(v.attackValue).toBe(5);
    expect(v.vpValue).toBe(3);
  });

  it("onEscape triggers scheme.onVillainEscape", () => {
    const v = new MadameHydra();
    const scheme = new NoopScheme("s1", "Cosmic Cube");
    const state = makeState();
    (state as GameState & { scheme: NoopScheme }).scheme = scheme;
    v.onEscape(state);
    expect(scheme.escapeCalled).toBe(true);
  });

  it("onAmbush returns state unchanged", () => {
    const v = new MadameHydra();
    const state = makeState();
    expect(v.onAmbush(state)).toBe(state);
  });

  it("onFight returns state unchanged", () => {
    const v = new MadameHydra();
    const state = makeState();
    expect(v.onFight(state)).toBe(state);
  });
});
