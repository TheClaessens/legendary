import { describe, it, expect } from "vitest";
import {
  Scheme,
  Mastermind,
  Tactic,
  HeroCard,
  Bystander,
  Wound,
} from "../index.js";
import {
  RedSkull,
  TacticCosmicCubePower,
  TacticHydraTroops,
  TacticMasterStrike,
  TacticRiseOfRedSkull,
} from "../mastermind/red-skull.js";
import type { GameState } from "../index.js";

// ── Stubs ────────────────────────────────────────────────────────────────────

class NoopScheme extends Scheme {
  schemeTwistCalled = false;
  onSchemeTwist(state: GameState): GameState {
    this.schemeTwistCalled = true;
    return state;
  }
}

class NoopTactic extends Tactic {
  onDefeat(state: GameState): GameState {
    return state;
  }
}

class NoopHero extends HeroCard {
  onPlay(state: GameState): GameState {
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
      deck: [],
      hand: [],
      discard: [],
      victory: [],
      recruitPoints: 3,
      attackPoints: 5,
    },
    ...overrides,
  };
}

// ── RedSkull ─────────────────────────────────────────────────────────────────

describe("RedSkull", () => {
  it("is a Mastermind with 4 tactics", () => {
    const mm = new RedSkull();
    expect(mm).toBeInstanceOf(Mastermind);
    expect(mm.tactics).toHaveLength(4);
  });

  it("each tactic is a Tactic instance", () => {
    const mm = new RedSkull();
    mm.tactics.forEach((t) => expect(t).toBeInstanceOf(Tactic));
  });
});

// ── Tactic: CosmicCubePower ──────────────────────────────────────────────────

describe("TacticCosmicCubePower.onDefeat", () => {
  it("reduces player.attackPoints by 2", () => {
    const tactic = new TacticCosmicCubePower();
    const state = makeState({ player: { ...makeState().player, attackPoints: 5 } });
    const next = tactic.onDefeat(state);
    expect(next.player.attackPoints).toBe(3);
  });

  it("does not reduce below 0", () => {
    const tactic = new TacticCosmicCubePower();
    const state = makeState({ player: { ...makeState().player, attackPoints: 1 } });
    const next = tactic.onDefeat(state);
    expect(next.player.attackPoints).toBe(0);
  });
});

// ── Tactic: HydraTroops ──────────────────────────────────────────────────────

describe("TacticHydraTroops.onDefeat", () => {
  it("adds a Wound to player.discard", () => {
    const tactic = new TacticHydraTroops();
    const state = makeState();
    const next = tactic.onDefeat(state);
    expect(next.player.discard).toHaveLength(1);
    expect(next.player.discard[0]).toBeInstanceOf(Wound);
  });
});

// ── Tactic: MasterStrike ─────────────────────────────────────────────────────

describe("TacticMasterStrike.onDefeat", () => {
  it("triggers scheme.onSchemeTwist", () => {
    const tactic = new TacticMasterStrike();
    const scheme = new NoopScheme("s1", "Cosmic Cube");
    const state = makeState();
    (state as GameState & { scheme: NoopScheme }).scheme = scheme;
    tactic.onDefeat(state);
    expect(scheme.schemeTwistCalled).toBe(true);
  });
});

// ── Tactic: RiseOfRedSkull ───────────────────────────────────────────────────

describe("TacticRiseOfRedSkull.onDefeat", () => {
  it("returns state unchanged", () => {
    const tactic = new TacticRiseOfRedSkull();
    const state = makeState();
    expect(tactic.onDefeat(state)).toBe(state);
  });
});
