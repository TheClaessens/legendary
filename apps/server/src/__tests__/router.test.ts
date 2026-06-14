import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@legendary/db", () => ({
  prisma: {
    game: {
      findUnique: vi.fn(),
    },
  },
}));

import { appRouter } from "../router.js";
import { prisma } from "@legendary/db";

const createCaller = appRouter.createCaller;

describe("game.get", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns null when the game does not exist", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

    const caller = createCaller({});
    const result = await caller.game.get({ id: "nonexistent" });

    expect(result).toBeNull();
    expect(prisma.game.findUnique).toHaveBeenCalledWith({
      where: { id: "nonexistent" },
    });
  });

  it("returns the game record when it exists", async () => {
    const mockGame = {
      id: "game-1",
      state: { phase: "VILLAIN_DECK_FLIP" },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
    vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as never);

    const caller = createCaller({});
    const result = await caller.game.get({ id: "game-1" });

    expect(result).toEqual(mockGame);
  });
});
