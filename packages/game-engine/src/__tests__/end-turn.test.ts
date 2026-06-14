import { describe, it, expect } from "vitest";
import type { GameState } from "../base.js";
import { Wound } from "../base.js";
import { CosmicCubeScheme } from "../schemes/cosmic-cube.js";
import { RedSkull } from "../mastermind/red-skull.js";
import { ShieldAgent, ShieldTrooper } from "../heroes/shield.js";
import { endTurn } from "../game-actions.js";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: "MAIN",
    status: "IN_PROGRESS",
    scheme: new CosmicCubeScheme(),
    mastermind: new RedSkull(),
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

describe("endTurn", () => {
  it("throws when phase is not MAIN", () => {
    const state = makeState({ phase: "VILLAIN_DECK_FLIP" });
    expect(() => endTurn(state)).toThrow();
  });

  it("moves hand and playedThisTurn to discard", () => {
    const agent = new ShieldAgent("a-0");
    const trooper = new ShieldTrooper("t-0");
    const state = makeState({
      player: {
        ...makeState().player,
        hand: [agent],
        playedThisTurn: [trooper],
        deck: Array.from({ length: 6 }, (_, i) => new ShieldAgent(`deck-${i}`)),
      },
    });

    const result = endTurn(state);

    expect(result.player.discard).toContain(agent);
    expect(result.player.discard).toContain(trooper);
  });

  it("draws 6 cards from deck", () => {
    const deckCards = Array.from({ length: 10 }, (_, i) => new ShieldAgent(`deck-${i}`));
    const state = makeState({ player: { ...makeState().player, deck: deckCards } });

    const result = endTurn(state);

    expect(result.player.hand).toHaveLength(6);
    expect(result.player.deck).toHaveLength(4);
  });

  it("reshuffles discard into deck when deck is exhausted", () => {
    const handCard = new ShieldAgent("hand-0");
    const discardCards = Array.from({ length: 10 }, (_, i) => new ShieldAgent(`disc-${i}`));
    const state = makeState({
      player: {
        ...makeState().player,
        hand: [handCard],
        discard: discardCards,
        deck: [],
      },
    });

    const result = endTurn(state);

    expect(result.player.hand).toHaveLength(6);
    expect(result.player.discard).toHaveLength(0);
    // deck has remaining cards after drawing 6 (original discard 10 + hand 1 = 11 total, minus 6 drawn = 5)
    expect(result.player.deck).toHaveLength(5);
  });

  it("resets recruitPoints and attackPoints to 0", () => {
    const state = makeState({
      player: {
        ...makeState().player,
        deck: Array.from({ length: 6 }, (_, i) => new ShieldAgent(`deck-${i}`)),
        recruitPoints: 5,
        attackPoints: 3,
      },
    });

    const result = endTurn(state);

    expect(result.player.recruitPoints).toBe(0);
    expect(result.player.attackPoints).toBe(0);
  });

  it("clears playedThisTurn", () => {
    const state = makeState({
      player: {
        ...makeState().player,
        deck: Array.from({ length: 6 }, (_, i) => new ShieldAgent(`deck-${i}`)),
        playedThisTurn: [new ShieldAgent("played-0")],
      },
    });

    const result = endTurn(state);

    expect(result.player.playedThisTurn).toHaveLength(0);
  });

  it("transitions phase to VILLAIN_DECK_FLIP", () => {
    const state = makeState({
      player: { ...makeState().player, deck: Array.from({ length: 6 }, (_, i) => new ShieldAgent(`deck-${i}`)) },
    });

    const result = endTurn(state);

    expect(result.phase).toBe("VILLAIN_DECK_FLIP");
  });

  it("draws fewer than 6 when total cards less than 6", () => {
    const deckCards = [new ShieldAgent("deck-0"), new ShieldAgent("deck-1")];
    const state = makeState({ player: { ...makeState().player, deck: deckCards } });

    const result = endTurn(state);

    expect(result.player.hand).toHaveLength(2);
  });

  it("wounds in discard stay in new deck after reshuffle", () => {
    const wound = new Wound("w-0");
    const state = makeState({
      player: {
        ...makeState().player,
        hand: [],
        discard: [wound, ...Array.from({ length: 5 }, (_, i) => new ShieldAgent(`disc-${i}`))],
        deck: [],
      },
    });

    const result = endTurn(state);

    const allCards = [...result.player.hand, ...result.player.deck, ...result.player.discard];
    expect(allCards.some((c) => c.id === wound.id)).toBe(true);
  });
});
