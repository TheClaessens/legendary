import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Board from "../Board.js";

describe("Board", () => {
  it("renders all zone labels", () => {
    render(<Board />);
    expect(screen.getByText("Mastermind")).toBeInTheDocument();
    expect(screen.getByText("Scheme")).toBeInTheDocument();
    expect(screen.getByText("Villain Deck")).toBeInTheDocument();
    expect(screen.getByText("Hero Deck")).toBeInTheDocument();
    expect(screen.getByText(/^city$/i)).toBeInTheDocument();
    expect(screen.getByText("Sewers")).toBeInTheDocument();
    expect(screen.getByText(/^hq$/i)).toBeInTheDocument();
    expect(screen.getByText("Player Hand")).toBeInTheDocument();
    expect(screen.getByText("Deck")).toBeInTheDocument();
    expect(screen.getByText("Discard")).toBeInTheDocument();
    expect(screen.getByText("Victory Pile")).toBeInTheDocument();
    expect(screen.getByText("KO Pile")).toBeInTheDocument();
  });

  it("HQ has 5 card slots", () => {
    render(<Board />);
    const hqSlots = screen.getAllByTestId("hq-slot");
    expect(hqSlots).toHaveLength(5);
  });

  it("City has 5 spaces", () => {
    render(<Board />);
    const citySpaces = screen.getAllByTestId("city-space");
    expect(citySpaces).toHaveLength(5);
  });

  it("Player Hand section renders", () => {
    render(<Board />);
    expect(screen.getByTestId("player-hand")).toBeInTheDocument();
  });
});
