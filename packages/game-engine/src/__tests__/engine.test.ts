import { describe, it, expect } from "vitest";
import {
  Scheme,
  Mastermind,
  Tactic,
  HeroCard,
  Villain,
  Bystander,
  Wound,
} from "../index.js";
import type { GameState } from "../index.js";

// ── Concrete test doubles ────────────────────────────────────────────────────

class TestScheme extends Scheme {}

class TestTactic extends Tactic {
  onDefeat(state: GameState): GameState {
    return state;
  }
}

class TestHeroCard extends HeroCard {
  onPlay(state: GameState): GameState {
    return state;
  }
}

class TestVillain extends Villain {
  onAmbush(state: GameState): GameState {
    return state;
  }
  onEscape(state: GameState): GameState {
    return state;
  }
  onFight(state: GameState): GameState {
    return state;
  }
}

// ── Minimal state factory ────────────────────────────────────────────────────

function makeState(overrides?: Partial<GameState>): GameState {
  const scheme = new TestScheme("scheme-1", "Test Scheme");
  const tactic = new TestTactic("t1", "Tactic 1");
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

// ── Scheme ───────────────────────────────────────────────────────────────────

describe("Scheme", () => {
  it("checkWinCondition returns false by default", () => {
    const scheme = new TestScheme("s1", "Cosmic Cube");
    expect(scheme.checkWinCondition(makeState())).toBe(false);
  });

  it("checkLoseCondition returns false by default", () => {
    const scheme = new TestScheme("s1", "Cosmic Cube");
    expect(scheme.checkLoseCondition(makeState())).toBe(false);
  });

  it("onSchemeTwist returns state unchanged by default", () => {
    const scheme = new TestScheme("s1", "Cosmic Cube");
    const state = makeState();
    expect(scheme.onSchemeTwist(state)).toBe(state);
  });

  it("onVillainEscape returns state unchanged by default", () => {
    const scheme = new TestScheme("s1", "Cosmic Cube");
    const state = makeState();
    expect(scheme.onVillainEscape(state)).toBe(state);
  });
});

// ── Mastermind ───────────────────────────────────────────────────────────────

describe("Mastermind", () => {
  it("holds its tactics array", () => {
    const t1 = new TestTactic("t1", "Tactic One");
    const t2 = new TestTactic("t2", "Tactic Two");
    const mm = new Mastermind("mm1", "Red Skull", [t1, t2]);
    expect(mm.tactics).toEqual([t1, t2]);
  });
});

// ── Tactic ───────────────────────────────────────────────────────────────────

describe("Tactic", () => {
  it("onDefeat hook is callable and receives state", () => {
    const tactic = new TestTactic("t1", "March of the Hydra");
    const state = makeState();
    expect(tactic.onDefeat(state)).toBe(state);
  });
});

// ── HeroCard ─────────────────────────────────────────────────────────────────

describe("HeroCard", () => {
  it("onPlay hook is callable and receives state", () => {
    const hero = new TestHeroCard("h1", "Iron Man");
    const state = makeState();
    expect(hero.onPlay(state)).toBe(state);
  });
});

// ── Villain ──────────────────────────────────────────────────────────────────

describe("Villain", () => {
  it("onAmbush hook is callable", () => {
    const villain = new TestVillain("v1", "Baron Strucker", 7, 3);
    const state = makeState();
    expect(villain.onAmbush(state)).toBe(state);
  });

  it("onEscape hook is callable", () => {
    const villain = new TestVillain("v1", "Baron Strucker", 7, 3);
    const state = makeState();
    expect(villain.onEscape(state)).toBe(state);
  });

  it("onFight hook is callable", () => {
    const villain = new TestVillain("v1", "Baron Strucker", 7, 3);
    const state = makeState();
    expect(villain.onFight(state)).toBe(state);
  });
});

// ── Bystander ────────────────────────────────────────────────────────────────

describe("Bystander", () => {
  it("has vpValue of 1", () => {
    const b = new Bystander("by1");
    expect(b.vpValue).toBe(1);
  });

  it("defaults name to Bystander", () => {
    const b = new Bystander("by1");
    expect(b.name).toBe("Bystander");
  });
});

// ── Wound ────────────────────────────────────────────────────────────────────

describe("Wound", () => {
  it("has vpValue of 0", () => {
    const w = new Wound("w1");
    expect(w.vpValue).toBe(0);
  });

  it("defaults name to Wound", () => {
    const w = new Wound("w1");
    expect(w.name).toBe("Wound");
  });
});
