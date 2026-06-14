import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../trpc.js", () => ({
  trpc: {
    game: {
      create: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          isPending: false,
          isError: false,
        })),
      },
    },
  },
}));

import App from "../App.js";

describe("App", () => {
  it("shows New Game button on launch", () => {
    render(<App />);
    expect(screen.getByTestId("new-game-btn")).toBeInTheDocument();
    expect(screen.getByText(/new game/i)).toBeInTheDocument();
  });

  it("shows Legendary title on launch", () => {
    render(<App />);
    expect(screen.getByText("Legendary")).toBeInTheDocument();
  });
});
