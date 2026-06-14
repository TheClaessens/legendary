import { describe, it, expect, vi } from "vitest";
import type { GameState } from "../base.js";
import { Mastermind, Scheme, Villain, Bystander } from "../base.js";
import { HydraSoldier } from "../villains/hydra.js";
import { CosmicCubeScheme } from "../schemes/cosmic-cube.js";
import { RedSkull } from "../mastermind/red-skull.js";
import { flipVillainDeck } from "../game-logic.js";

function makeState(overrides: Partial<GameState> = {}): GameState {
  const scheme = new CosmicCubeScheme();
  const mastermind = new RedSkull();
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

describe("flipVillainDeck", () => {
  it("places villain at city[0] and shifts existing villains right", () => {
    const villainA = new HydraSoldier();
    const villainB = new HydraSoldier();
    const newVillain = new HydraSoldier();
    const state = makeState({
      villainDeck: [newVillain],
      city: [villainA, villainB, null, null, null],
    });

    const result = flipVillainDeck(state);

    expect(result.city[0]).toBe(newVillain);
    expect(result.city[1]).toBe(villainA);
    expect(result.city[2]).toBe(villainB);
    expect(result.city[3]).toBeNull();
    expect(result.city[4]).toBeNull();
  });

  it("removes flipped villain from villainDeck", () => {
    const villain = new HydraSoldier();
    const state = makeState({ villainDeck: [villain] });

    const result = flipVillainDeck(state);

    expect(result.villainDeck).toHaveLength(0);
  });

  it("calls villain onAmbush when entering city", () => {
    const villain = new HydraSoldier();
    const spy = vi.spyOn(villain, "onAmbush");
    const state = makeState({ villainDeck: [villain] });

    flipVillainDeck(state);

    expect(spy).toHaveBeenCalled();
  });

  it("villain at city[4] escapes to sewers and onEscape is called", () => {
    const escapee = new HydraSoldier();
    const spy = vi.spyOn(escapee, "onEscape");
    const state = makeState({
      villainDeck: [new HydraSoldier()],
      city: [
        new HydraSoldier(),
        new HydraSoldier(),
        new HydraSoldier(),
        new HydraSoldier(),
        escapee,
      ],
    });

    const result = flipVillainDeck(state);

    expect(spy).toHaveBeenCalled();
    expect(result.sewers).toContain(escapee);
  });

  it("null at city[4] does not add to sewers", () => {
    const state = makeState({
      villainDeck: [new HydraSoldier()],
      city: [new HydraSoldier(), null, null, null, null],
    });

    const result = flipVillainDeck(state);

    expect(result.sewers).toHaveLength(0);
  });

  it("scheme twist calls scheme.onSchemeTwist", () => {
    const schemeTwist = { id: "st-0", name: "Scheme Twist" };
    const scheme = new CosmicCubeScheme();
    const spy = vi.spyOn(scheme, "onSchemeTwist");
    const state = makeState({ villainDeck: [schemeTwist], scheme });

    flipVillainDeck(state);

    expect(spy).toHaveBeenCalled();
  });

  it("master strike calls mastermind.onMasterStrike", () => {
    const masterStrike = { id: "ms-0", name: "Master Strike" };
    const mastermind = new RedSkull();
    const spy = vi.spyOn(mastermind, "onMasterStrike");
    const state = makeState({ villainDeck: [masterStrike], mastermind });

    flipVillainDeck(state);

    expect(spy).toHaveBeenCalled();
  });

  it("bystander goes to koPile", () => {
    const bystander = new Bystander("by-0");
    const state = makeState({ villainDeck: [bystander] });

    const result = flipVillainDeck(state);

    expect(result.koPile).toContain(bystander);
    expect(result.city.every((s) => s === null)).toBe(true);
  });

  it("transitions phase to MAIN after flip", () => {
    const state = makeState({ villainDeck: [new HydraSoldier()] });

    const result = flipVillainDeck(state);

    expect(result.phase).toBe("MAIN");
  });

  it("sets status to LOST when scheme lose condition met", () => {
    const scheme = new CosmicCubeScheme();
    const state = makeState({
      villainDeck: [{ id: "st-0", name: "Scheme Twist" }],
      scheme,
      schemeTwistCount: 4,
    });

    const result = flipVillainDeck(state);

    expect(result.status).toBe("LOST");
  });

  it("keeps status IN_PROGRESS when lose condition not met", () => {
    const state = makeState({ villainDeck: [new HydraSoldier()] });

    const result = flipVillainDeck(state);

    expect(result.status).toBe("IN_PROGRESS");
  });

  it("does nothing when villainDeck is empty", () => {
    const state = makeState({ villainDeck: [] });

    const result = flipVillainDeck(state);

    expect(result.phase).toBe("VILLAIN_DECK_FLIP");
    expect(result.status).toBe("IN_PROGRESS");
  });
});
