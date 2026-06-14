import { describe, it, expect } from "vitest";
import type { GameState } from "../base.js";
import { Mastermind, Scheme } from "../base.js";
import { CosmicCubeScheme } from "../schemes/cosmic-cube.js";
import { RedSkull } from "../mastermind/red-skull.js";
import { ShieldAgent, ShieldTrooper } from "../heroes/shield.js";
import { IronManBlazingRepulsor, IronManThinkingCap, IronManInvincibleArmor } from "../heroes/iron-man.js";
import { playCard } from "../game-actions.js";

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

describe("playCard", () => {
  it("throws when card not in hand", () => {
    const state = makeState();
    expect(() => playCard(state, "missing-id")).toThrow();
  });

  it("throws when phase is not MAIN", () => {
    const agent = new ShieldAgent("agent-0");
    const state = makeState({
      phase: "VILLAIN_DECK_FLIP",
      player: { ...makeState().player, hand: [agent] },
    });
    expect(() => playCard(state, agent.id)).toThrow();
  });

  it("removes card from hand", () => {
    const agent = new ShieldAgent("agent-0");
    const state = makeState({ player: { ...makeState().player, hand: [agent] } });

    const result = playCard(state, agent.id);

    expect(result.player.hand).toHaveLength(0);
  });

  it("adds card to playedThisTurn", () => {
    const agent = new ShieldAgent("agent-0");
    const state = makeState({ player: { ...makeState().player, hand: [agent] } });

    const result = playCard(state, agent.id);

    expect(result.player.playedThisTurn).toContain(agent);
  });

  it("calls card onPlay and accumulates recruitPoints", () => {
    const agent = new ShieldAgent("agent-0");
    const state = makeState({ player: { ...makeState().player, hand: [agent] } });

    const result = playCard(state, agent.id);

    expect(result.player.recruitPoints).toBe(1);
  });

  it("calls card onPlay and accumulates attackPoints", () => {
    const trooper = new ShieldTrooper("trooper-0");
    const state = makeState({ player: { ...makeState().player, hand: [trooper] } });

    const result = playCard(state, trooper.id);

    expect(result.player.attackPoints).toBe(1);
  });

  it("accumulates points across multiple cards played in one turn", () => {
    const agent1 = new ShieldAgent("agent-0");
    const agent2 = new ShieldAgent("agent-1");
    const trooper = new ShieldTrooper("trooper-0");
    const state = makeState({ player: { ...makeState().player, hand: [agent1, agent2, trooper] } });

    const s1 = playCard(state, agent1.id);
    const s2 = playCard(s1, agent2.id);
    const s3 = playCard(s2, trooper.id);

    expect(s3.player.recruitPoints).toBe(2);
    expect(s3.player.attackPoints).toBe(1);
    expect(s3.player.hand).toHaveLength(0);
    expect(s3.player.playedThisTurn).toHaveLength(3);
  });

  it("team bonus applies when another team card already played", () => {
    const ironMan1 = new IronManBlazingRepulsor();
    const ironMan2 = new IronManInvincibleArmor();
    const state = makeState({
      player: {
        ...makeState().player,
        hand: [ironMan1, ironMan2],
      },
    });

    const s1 = playCard(state, ironMan1.id);
    const s2 = playCard(s1, ironMan2.id);

    // IronManInvincibleArmor: +2 atk +1 rec base, +2 atk team bonus
    expect(s2.player.attackPoints).toBe(4 + 2 + 2); // blazing (4) + invincible armor base (2) + team bonus (2)
    expect(s2.player.recruitPoints).toBe(1);
  });
});
