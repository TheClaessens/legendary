import { useState } from "react";
import Board from "./Board.js";
import { trpc } from "./trpc.js";
import type { LiveGameState } from "./types.js";

export default function App() {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);

  const createGame = trpc.game.create.useMutation({
    onSuccess: (data) => {
      setGameState(data.state as LiveGameState);
    },
  });

  if (!gameState) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold tracking-widest uppercase">Legendary</h1>
        <button
          data-testid="new-game-btn"
          onClick={() => createGame.mutate()}
          disabled={createGame.isPending}
          className="px-8 py-3 bg-red-700 hover:bg-red-600 disabled:opacity-50 rounded text-white font-bold uppercase tracking-widest text-lg"
        >
          {createGame.isPending ? "Creating..." : "New Game"}
        </button>
        {createGame.isError && (
          <p className="text-red-400 text-sm">Failed to create game. Is the server running?</p>
        )}
      </main>
    );
  }

  return <Board gameState={gameState} />;
}
