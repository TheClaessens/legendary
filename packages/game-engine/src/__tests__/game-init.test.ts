import { describe, it, expect } from "vitest";
import { createInitialState } from "../game-init.js";
import { ShieldAgent, ShieldTrooper } from "../heroes/shield.js";
import { RedSkull } from "../mastermind/red-skull.js";
import { CosmicCubeScheme } from "../schemes/cosmic-cube.js";

describe("createInitialState", () => {
  it("sets phase to VILLAIN_DECK_FLIP", () => {
    const state = createInitialState();
    expect(state.phase).toBe("VILLAIN_DECK_FLIP");
  });

  it("uses RedSkull as mastermind", () => {
    const state = createInitialState();
    expect(state.mastermind).toBeInstanceOf(RedSkull);
  });

  it("uses CosmicCubeScheme", () => {
    const state = createInitialState();
    expect(state.scheme).toBeInstanceOf(CosmicCubeScheme);
  });

  it("player deck has exactly 12 cards", () => {
    const state = createInitialState();
    expect(state.player.deck).toHaveLength(12);
  });

  it("player deck has 8 ShieldAgents and 4 ShieldTroopers", () => {
    const state = createInitialState();
    const agents = state.player.deck.filter((c) => c instanceof ShieldAgent);
    const troopers = state.player.deck.filter((c) => c instanceof ShieldTrooper);
    expect(agents).toHaveLength(8);
    expect(troopers).toHaveLength(4);
  });

  it("HQ has exactly 5 cards", () => {
    const state = createInitialState();
    const filled = state.hq.filter((c) => c !== null);
    expect(filled).toHaveLength(5);
  });

  it("city has 5 null spaces", () => {
    const state = createInitialState();
    expect(state.city).toHaveLength(5);
    expect(state.city.every((c) => c === null)).toBe(true);
  });

  it("villain deck is non-empty", () => {
    const state = createInitialState();
    expect(state.villainDeck.length).toBeGreaterThan(0);
  });

  it("hero deck has 10 cards remaining after HQ deal", () => {
    const state = createInitialState();
    expect(state.heroDeck).toHaveLength(10);
  });

  it("schemeTwistCount starts at 0", () => {
    const state = createInitialState();
    expect(state.schemeTwistCount).toBe(0);
  });
});
