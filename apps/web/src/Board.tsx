export default function Board() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col gap-2 p-2 overflow-hidden">
      {/* Top row: Mastermind + Tactics | Scheme | Villain Deck | Hero Deck */}
      <div className="flex gap-2 h-36">
        <div className="flex gap-1 flex-1">
          <Zone label="Mastermind" className="w-28" />
          <Zone label="Tactics" className="flex-1" />
        </div>
        <Zone label="Scheme" className="w-36" />
        <Zone label="Villain Deck" className="w-28" />
        <Zone label="Hero Deck" className="w-28" />
      </div>

      {/* City: 5 spaces */}
      <div className="flex gap-2 items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-8">
          City
        </span>
        <div className="flex gap-2 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              data-testid="city-space"
              className="flex-1 h-28 border border-dashed border-gray-600 rounded flex items-center justify-center text-gray-600 text-xs"
            >
              Space {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Sewers | HQ */}
      <div className="flex gap-2">
        <Zone label="Sewers" className="w-36 h-28" />
        <div className="flex flex-col flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            HQ
          </span>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                data-testid="hq-slot"
                className="flex-1 h-28 border border-dashed border-yellow-600 rounded flex items-center justify-center text-gray-600 text-xs"
              >
                Slot {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Hand */}
      <div
        data-testid="player-hand"
        className="flex flex-col flex-1 min-h-0"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Player Hand
        </span>
        <div className="flex gap-2 flex-1 border border-dashed border-gray-600 rounded p-2">
          <span className="text-gray-600 text-xs self-center mx-auto">
            Cards will appear here
          </span>
        </div>
      </div>

      {/* Footer: Deck | Discard | Victory | KO Pile */}
      <div className="flex gap-2 h-20">
        <Zone label="Deck" className="flex-1" />
        <Zone label="Discard" className="flex-1" />
        <Zone label="Victory Pile" className="flex-1" />
        <Zone label="KO Pile" className="flex-1" />
      </div>
    </div>
  );
}

function Zone({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`border border-gray-700 rounded bg-gray-900 flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-gray-400 ${className}`}
    >
      {label}
    </div>
  );
}
