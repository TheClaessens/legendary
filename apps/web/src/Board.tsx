import { useState, forwardRef } from "react";
import { DndContext, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import type { CardData, LiveGameState } from "./types.js";
import { trpc } from "./trpc.js";
import { handleDragEnd } from "./dnd-handlers.js";

interface BoardProps {
  gameId?: string;
  gameState?: LiveGameState | null;
  onStateChange?: (state: LiveGameState) => void;
}

export default function Board({ gameId, gameState, onStateChange }: BoardProps) {
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const playCardMutation = trpc.game.playCard.useMutation({
    onSuccess: (data) => onStateChange?.(data.state as LiveGameState),
  });
  const recruitHeroMutation = trpc.game.recruitHero.useMutation({
    onSuccess: (data) => onStateChange?.(data.state as LiveGameState),
  });
  const fightVillainMutation = trpc.game.fightVillain.useMutation({
    onSuccess: (data) => onStateChange?.(data.state as LiveGameState),
  });
  const fightMastermindMutation = trpc.game.fightMastermind.useMutation({
    onSuccess: (data) => onStateChange?.(data.state as LiveGameState),
  });

  const callbacks = {
    playCard: (cardId: string) => gameId && playCardMutation.mutate({ id: gameId, cardId }),
    recruitHero: (hqSlot: number) => gameId && recruitHeroMutation.mutate({ id: gameId, hqSlot }),
    fightVillain: (cityIndex: number) => gameId && fightVillainMutation.mutate({ id: gameId, cityIndex }),
    fightMastermind: () => gameId && fightMastermindMutation.mutate({ id: gameId }),
  };

  return (
    <DndContext
      onDragStart={(e) => {
        const data = e.active.data.current as { cardData?: CardData } | undefined;
        setActiveCard(data?.cardData ?? null);
      }}
      onDragEnd={(e) => {
        setActiveCard(null);
        handleDragEnd(e, callbacks);
      }}
    >
      <div className="min-h-screen bg-gray-950 text-white flex flex-col gap-2 p-2 overflow-hidden">
        {/* Top row */}
        <div className="flex gap-2 h-36">
          <div className="flex gap-1 flex-1">
            <DraggableMastermind gameState={gameState} />
            <Zone className="flex-1">
              <ZoneLabel>Tactics</ZoneLabel>
            </Zone>
          </div>
          <Zone className="w-40">
            <ZoneLabel>Scheme</ZoneLabel>
            {gameState && <div className="text-white text-xs mt-1 text-center px-1">{gameState.scheme.name}</div>}
          </Zone>
          <Zone className="w-28">
            <ZoneLabel>Villain Deck</ZoneLabel>
            {gameState && <div className="text-yellow-400 text-lg font-bold">{gameState.villainDeck.length}</div>}
          </Zone>
          <Zone className="w-28">
            <ZoneLabel>Hero Deck</ZoneLabel>
            {gameState && <div className="text-yellow-400 text-lg font-bold">{gameState.heroDeck.length}</div>}
          </Zone>
        </div>

        {/* City */}
        <FightZone>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-8">City</span>
          <div className="flex gap-2 flex-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const villain = gameState?.city[i] ?? null;
              return (
                <DraggableCityVillain key={i} villain={villain} cityIndex={i} />
              );
            })}
          </div>
        </FightZone>

        {/* Sewers | HQ */}
        <div className="flex gap-2">
          <Zone className="w-36 h-28">
            <ZoneLabel>Sewers</ZoneLabel>
            {gameState && gameState.sewers.length > 0 && (
              <div className="text-red-400 text-sm">{gameState.sewers.length} escaped</div>
            )}
          </Zone>
          <div className="flex flex-col flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">HQ</span>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const card = gameState?.hq[i] ?? null;
                return (
                  <DraggableHQCard key={i} card={card} slotIndex={i} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Player Hand — Drop zone for playing cards */}
        <PlayZone>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            Player Hand
            {gameState && <span className="ml-2 text-gray-500">({gameState.player.hand.length} cards)</span>}
          </span>
          <div data-testid="player-hand" className="flex gap-2 flex-1 border border-dashed border-gray-600 rounded p-2 flex-wrap">
            {gameState?.player.hand.length ? (
              gameState.player.hand.map((card) => <DraggableHandCard key={card.id} card={card} />)
            ) : (
              <span className="text-gray-600 text-xs self-center mx-auto">Cards will appear here</span>
            )}
          </div>
        </PlayZone>

        {/* Footer */}
        <div className="flex gap-2 h-20">
          <FooterZone label="Deck" count={gameState?.player.deck.length} />
          <DiscardZone label="Discard" count={gameState?.player.discard.length} />
          <FooterZone label="Victory Pile" count={gameState?.player.victory.length} />
          <FooterZone label="KO Pile" count={gameState?.koPile.length} />
        </div>
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="border border-yellow-400 rounded bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
            {activeCard.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableMastermind({ gameState }: { gameState?: LiveGameState | null }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "mastermind-drag",
    data: { source: "mastermind", cardData: gameState ? { id: "mastermind", name: gameState.mastermind.name } : null },
  });

  return (
    <Zone className="w-28" ref={setNodeRef}>
      <ZoneLabel>Mastermind</ZoneLabel>
      {gameState && (
        <div
          {...listeners}
          {...attributes}
          className={`text-white text-xs font-bold mt-1 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
        >
          {gameState.mastermind.name}
        </div>
      )}
    </Zone>
  );
}

function DraggableHandCard({ card }: { card: CardData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `hand-${card.id}`,
    data: { source: "hand", cardId: card.id, cardData: card },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`border border-gray-600 rounded bg-gray-800 px-2 py-1 text-xs text-white cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      {card.name}
    </div>
  );
}

function DraggableHQCard({ card, slotIndex }: { card: CardData | null; slotIndex: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `hq-${slotIndex}`,
    data: { source: "hq", slotIndex, cardData: card },
    disabled: !card,
  });

  return (
    <div
      ref={setNodeRef}
      data-testid="hq-slot"
      className={`flex-1 h-28 border border-dashed border-yellow-600 rounded flex items-center justify-center text-xs p-1 ${card ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "opacity-50" : ""}`}
      {...(card ? { ...listeners, ...attributes } : {})}
    >
      {card ? (
        <span className="text-white font-semibold text-center">{card.name}</span>
      ) : (
        <span className="text-gray-600">Slot {slotIndex + 1}</span>
      )}
    </div>
  );
}

function DraggableCityVillain({ villain, cityIndex }: { villain: CardData | null; cityIndex: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `city-${cityIndex}`,
    data: { source: "city", cityIndex, cardData: villain },
    disabled: !villain,
  });

  return (
    <div
      ref={setNodeRef}
      data-testid="city-space"
      className={`flex-1 h-28 border border-dashed border-gray-600 rounded flex items-center justify-center text-xs ${villain ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "opacity-50" : ""}`}
      {...(villain ? { ...listeners, ...attributes } : {})}
    >
      {villain ? (
        <span className="text-white font-semibold text-center px-1">{villain.name}</span>
      ) : (
        <span className="text-gray-600">Space {cityIndex + 1}</span>
      )}
    </div>
  );
}

function PlayZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "play-zone" });
  return (
    <div
      ref={setNodeRef}
      data-testid="play-zone"
      className={`flex flex-col flex-1 min-h-0 transition-colors ${isOver ? "ring-2 ring-yellow-400" : ""}`}
    >
      {children}
    </div>
  );
}

function FightZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "fight-zone" });
  return (
    <div
      ref={setNodeRef}
      data-testid="fight-zone"
      className={`flex gap-2 items-center transition-colors ${isOver ? "ring-2 ring-red-500 rounded" : ""}`}
    >
      {children}
    </div>
  );
}

function DiscardZone({ label, count }: { label: string; count?: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: "discard-zone" });
  return (
    <div
      ref={setNodeRef}
      data-testid="discard-zone"
      className={`flex-1 border rounded bg-gray-900 flex flex-col items-center justify-center text-xs transition-colors ${isOver ? "border-yellow-400 ring-2 ring-yellow-400" : "border-gray-700"}`}
    >
      <span className="font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      {count !== undefined && <span className="text-yellow-400 font-bold">{count}</span>}
    </div>
  );
}

const Zone = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className = "" }, ref) => (
    <div ref={ref} className={`border border-gray-700 rounded bg-gray-900 flex flex-col items-center justify-center p-1 ${className}`}>
      {children}
    </div>
  ),
);

function ZoneLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{children}</span>;
}

function FooterZone({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex-1 border border-gray-700 rounded bg-gray-900 flex flex-col items-center justify-center text-xs">
      <span className="font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      {count !== undefined && <span className="text-yellow-400 font-bold">{count}</span>}
    </div>
  );
}
