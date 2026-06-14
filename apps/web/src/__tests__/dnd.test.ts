import { describe, it, expect, vi } from "vitest";
import { handleDragEnd } from "../dnd-handlers.js";
import type { DragEndEvent } from "@dnd-kit/core";

function makeDragEvent(sourceData: Record<string, unknown>, overId: string | null): DragEndEvent {
  return {
    active: {
      id: "active-id",
      data: { current: sourceData },
      rect: { current: { initial: null, translated: null } },
    },
    over: overId ? { id: overId, rect: {} as never, data: { current: {} }, disabled: false } : null,
    activatorEvent: {} as never,
    delta: { x: 0, y: 0 },
    collisions: [],
  } as DragEndEvent;
}

describe("handleDragEnd", () => {
  it("calls playCard when hand card dropped on play-zone", () => {
    const playCard = vi.fn();
    const event = makeDragEvent({ source: "hand", cardId: "im-blazing-repulsor" }, "play-zone");

    handleDragEnd(event, { playCard, recruitHero: vi.fn(), fightVillain: vi.fn(), fightMastermind: vi.fn() });

    expect(playCard).toHaveBeenCalledWith("im-blazing-repulsor");
  });

  it("calls recruitHero when HQ card dropped on discard-zone", () => {
    const recruitHero = vi.fn();
    const event = makeDragEvent({ source: "hq", slotIndex: 2 }, "discard-zone");

    handleDragEnd(event, { playCard: vi.fn(), recruitHero, fightVillain: vi.fn(), fightMastermind: vi.fn() });

    expect(recruitHero).toHaveBeenCalledWith(2);
  });

  it("calls fightVillain when city villain dropped on fight-zone", () => {
    const fightVillain = vi.fn();
    const event = makeDragEvent({ source: "city", cityIndex: 1 }, "fight-zone");

    handleDragEnd(event, { playCard: vi.fn(), recruitHero: vi.fn(), fightVillain, fightMastermind: vi.fn() });

    expect(fightVillain).toHaveBeenCalledWith(1);
  });

  it("calls fightMastermind when mastermind card dropped on fight-zone", () => {
    const fightMastermind = vi.fn();
    const event = makeDragEvent({ source: "mastermind" }, "fight-zone");

    handleDragEnd(event, { playCard: vi.fn(), recruitHero: vi.fn(), fightVillain: vi.fn(), fightMastermind });

    expect(fightMastermind).toHaveBeenCalled();
  });

  it("does nothing when dropped outside a valid zone", () => {
    const playCard = vi.fn();
    const event = makeDragEvent({ source: "hand", cardId: "x" }, null);

    handleDragEnd(event, { playCard, recruitHero: vi.fn(), fightVillain: vi.fn(), fightMastermind: vi.fn() });

    expect(playCard).not.toHaveBeenCalled();
  });

  it("does nothing when source-zone combination does not match", () => {
    const recruitHero = vi.fn();
    const event = makeDragEnd({ source: "hand", cardId: "x" }, "discard-zone");

    handleDragEnd(event, { playCard: vi.fn(), recruitHero, fightVillain: vi.fn(), fightMastermind: vi.fn() });

    expect(recruitHero).not.toHaveBeenCalled();
  });
});

function makeDragEnd(sourceData: Record<string, unknown>, overId: string | null) {
  return makeDragEvent(sourceData, overId);
}
