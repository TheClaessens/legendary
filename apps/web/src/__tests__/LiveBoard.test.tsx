import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../trpc.js", () => ({
  trpc: {
    game: {
      create: { useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false, isError: false })) },
      playCard: { useMutation: vi.fn(() => ({ mutate: vi.fn() })) },
      recruitHero: { useMutation: vi.fn(() => ({ mutate: vi.fn() })) },
      fightVillain: { useMutation: vi.fn(() => ({ mutate: vi.fn() })) },
      fightMastermind: { useMutation: vi.fn(() => ({ mutate: vi.fn() })) },
    },
  },
}));

import Board from "../Board.js";
import type { LiveGameState } from "../types.js";

const mockGameState: LiveGameState = {
  phase: "VILLAIN_DECK_FLIP",
  scheme: { id: "cosmic-cube", name: "Unleash the Cosmic Cube" },
  mastermind: {
    id: "red-skull",
    name: "Red Skull",
    tactics: [{ id: "t1", name: "Tactic 1" }],
  },
  city: [null, null, null, null, null],
  sewers: [],
  heroDeck: [
    { id: "h1", name: "Iron Man: Blazing Repulsor" },
    { id: "h2", name: "Spider-Man: Web Swing" },
  ],
  hq: [
    { id: "h3", name: "Iron Man: Thinking Cap" },
    { id: "h4", name: "Wolverine: Adamantium Claws" },
    { id: "h5", name: "Spider-Man: Spider-Sense" },
    null,
    null,
  ],
  villainDeck: Array.from({ length: 24 }, (_, i) => ({ id: `v${i}`, name: "Card" })),
  koPile: [],
  schemeTwistCount: 0,
  player: {
    deck: Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, name: "S.H.I.E.L.D. Agent" })),
    hand: [
      { id: "h6", name: "Iron Man: Exothermic Blast" },
      { id: "h7", name: "S.H.I.E.L.D. Trooper" },
    ],
    discard: [],
    victory: [],
    playedThisTurn: [],
    recruitPoints: 0,
    attackPoints: 0,
  },
};

describe("Board with gameState", () => {
  it("renders mastermind name", () => {
    render(<Board gameState={mockGameState} />);
    expect(screen.getByText("Red Skull")).toBeInTheDocument();
  });

  it("renders scheme name", () => {
    render(<Board gameState={mockGameState} />);
    expect(screen.getByText("Unleash the Cosmic Cube")).toBeInTheDocument();
  });

  it("renders HQ card names for filled slots", () => {
    render(<Board gameState={mockGameState} />);
    expect(screen.getByText("Iron Man: Thinking Cap")).toBeInTheDocument();
    expect(screen.getByText("Wolverine: Adamantium Claws")).toBeInTheDocument();
  });

  it("renders villain deck card count", () => {
    render(<Board gameState={mockGameState} />);
    expect(screen.getByText(/villain deck/i)).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("renders hero deck count", () => {
    render(<Board gameState={mockGameState} />);
    expect(screen.getByText(/hero deck/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders player hand cards", () => {
    render(<Board gameState={mockGameState} />);
    expect(screen.getByText("Iron Man: Exothermic Blast")).toBeInTheDocument();
    expect(screen.getByText("S.H.I.E.L.D. Trooper")).toBeInTheDocument();
  });
});
