import type { DragEndEvent } from "@dnd-kit/core";

export interface DndCallbacks {
  playCard: (cardId: string) => void;
  recruitHero: (hqSlot: number) => void;
  fightVillain: (cityIndex: number) => void;
  fightMastermind: () => void;
}

export function handleDragEnd(event: DragEndEvent, callbacks: DndCallbacks): void {
  const { active, over } = event;
  if (!over) return;

  const source = active.data.current as Record<string, unknown> | undefined;
  if (!source) return;

  const overId = String(over.id);

  if (source.source === "hand" && overId === "play-zone") {
    callbacks.playCard(source.cardId as string);
  } else if (source.source === "hq" && overId === "discard-zone") {
    callbacks.recruitHero(source.slotIndex as number);
  } else if (source.source === "city" && overId === "fight-zone") {
    callbacks.fightVillain(source.cityIndex as number);
  } else if (source.source === "mastermind" && overId === "fight-zone") {
    callbacks.fightMastermind();
  }
}
