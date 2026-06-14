import type { CardData, LiveGameState } from "./types.js";

interface BoardProps {
  gameState?: LiveGameState | null;
}

export default function Board({ gameState }: BoardProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col gap-2 p-2 overflow-hidden">
      {/* Top row */}
      <div className="flex gap-2 h-36">
        <div className="flex gap-1 flex-1">
          <Zone className="w-28">
            <ZoneLabel>Mastermind</ZoneLabel>
            {gameState && <div className="text-white text-xs font-bold mt-1">{gameState.mastermind.name}</div>}
          </Zone>
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
      <div className="flex gap-2 items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-8">City</span>
        <div className="flex gap-2 flex-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const villain = gameState?.city[i] ?? null;
            return (
              <div
                key={i}
                data-testid="city-space"
                className="flex-1 h-28 border border-dashed border-gray-600 rounded flex items-center justify-center text-xs"
              >
                {villain ? (
                  <span className="text-white font-semibold text-center px-1">{villain.name}</span>
                ) : (
                  <span className="text-gray-600">Space {i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
                <div
                  key={i}
                  data-testid="hq-slot"
                  className="flex-1 h-28 border border-dashed border-yellow-600 rounded flex items-center justify-center text-xs p-1"
                >
                  {card ? (
                    <span className="text-white font-semibold text-center">{card.name}</span>
                  ) : (
                    <span className="text-gray-600">Slot {i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Player Hand */}
      <div data-testid="player-hand" className="flex flex-col flex-1 min-h-0">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Player Hand
          {gameState && <span className="ml-2 text-gray-500">({gameState.player.hand.length} cards)</span>}
        </span>
        <div className="flex gap-2 flex-1 border border-dashed border-gray-600 rounded p-2 flex-wrap">
          {gameState?.player.hand.length ? (
            gameState.player.hand.map((card) => <CardChip key={card.id} card={card} />)
          ) : (
            <span className="text-gray-600 text-xs self-center mx-auto">Cards will appear here</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 h-20">
        <FooterZone label="Deck" count={gameState?.player.deck.length} />
        <FooterZone label="Discard" count={gameState?.player.discard.length} />
        <FooterZone label="Victory Pile" count={gameState?.player.victory.length} />
        <FooterZone label="KO Pile" count={gameState?.koPile.length} />
      </div>
    </div>
  );
}

function Zone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-gray-700 rounded bg-gray-900 flex flex-col items-center justify-center p-1 ${className}`}>
      {children}
    </div>
  );
}

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

function CardChip({ card }: { card: CardData }) {
  return (
    <div className="border border-gray-600 rounded bg-gray-800 px-2 py-1 text-xs text-white">
      {card.name}
    </div>
  );
}
