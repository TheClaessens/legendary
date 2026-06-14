import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@legendary/db", () => ({
  prisma: {
    game: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { appRouter } from "../router.js";
import { prisma } from "@legendary/db";
import { createInitialState } from "@legendary/game-engine";

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

describe("game.create", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns a game id and initial state", async () => {
    vi.mocked(prisma.game.create).mockResolvedValue({
      id: "new-game-id",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.create();

    expect(result.id).toBe("new-game-id");
    expect(result.state).toBeDefined();
  });

  it("persists to DB with initial state", async () => {
    vi.mocked(prisma.game.create).mockResolvedValue({
      id: "g1",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    await caller.game.create();

    expect(prisma.game.create).toHaveBeenCalledOnce();
    const callArg = vi.mocked(prisma.game.create).mock.calls[0][0];
    expect(callArg.data.state).toBeDefined();
  });

  it("initial state has VILLAIN_DECK_FLIP phase", async () => {
    vi.mocked(prisma.game.create).mockResolvedValue({
      id: "g1",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.create();

    expect((result.state as { phase: string }).phase).toBe("VILLAIN_DECK_FLIP");
  });
});

describe("game.flipVillainDeck", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws NOT_FOUND when game does not exist", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

    const caller = createCaller({});
    await expect(caller.game.flipVillainDeck({ id: "missing" })).rejects.toThrow();
  });

  it("transitions phase to MAIN and persists updated state", async () => {
    const initialState = createInitialState();
    const serializedInitial = JSON.parse(JSON.stringify(initialState));
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "game-1",
      state: serializedInitial,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.game.update).mockResolvedValue({
      id: "game-1",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.flipVillainDeck({ id: "game-1" });

    expect(prisma.game.update).toHaveBeenCalledOnce();
    const updateArg = vi.mocked(prisma.game.update).mock.calls[0][0];
    expect((updateArg.data.state as { phase: string }).phase).toBe("MAIN");
    expect(result.id).toBe("game-1");
    expect((result.state as { phase: string }).phase).toBe("MAIN");
  });

  it("returns LOST status when scheme lose condition is met after flip", async () => {
    const initialState = createInitialState();
    const serializedInitial = JSON.parse(JSON.stringify(initialState));
    serializedInitial.schemeTwistCount = 4;
    serializedInitial.villainDeck = [{ id: "st-0", name: "Scheme Twist" }];

    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "game-2",
      state: serializedInitial,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.game.update).mockResolvedValue({
      id: "game-2",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.flipVillainDeck({ id: "game-2" });

    expect((result.state as { status: string }).status).toBe("LOST");
  });
});

describe("game.playCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws NOT_FOUND when game does not exist", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

    const caller = createCaller({});
    await expect(caller.game.playCard({ id: "missing", cardId: "x" })).rejects.toThrow();
  });

  it("plays a card and updates recruitPoints", async () => {
    const initialState = createInitialState();
    const serialized = JSON.parse(JSON.stringify(initialState));
    serialized.phase = "MAIN";
    serialized.player.hand = [{ id: "agent-0", name: "S.H.I.E.L.D. Agent" }];

    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "g1",
      state: serialized,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.game.update).mockResolvedValue({
      id: "g1",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.playCard({ id: "g1", cardId: "agent-0" });

    expect((result.state as { player: { recruitPoints: number } }).player.recruitPoints).toBe(1);
    expect((result.state as { player: { hand: unknown[] } }).player.hand).toHaveLength(0);
  });

  it("throws BAD_REQUEST when card not in hand", async () => {
    const initialState = createInitialState();
    const serialized = JSON.parse(JSON.stringify(initialState));
    serialized.phase = "MAIN";
    serialized.player.hand = [];

    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "g1",
      state: serialized,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    await expect(caller.game.playCard({ id: "g1", cardId: "not-in-hand" })).rejects.toThrow();
  });
});

describe("game.recruitHero", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("recruits hero from HQ and moves to discard", async () => {
    const initialState = createInitialState();
    const serialized = JSON.parse(JSON.stringify(initialState));
    serialized.phase = "MAIN";
    serialized.player.recruitPoints = 10;
    // hq[0] is an Iron Man card from initial setup — use its id
    const hqCardId = serialized.hq[0].id;

    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "g1",
      state: serialized,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.game.update).mockResolvedValue({
      id: "g1",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.recruitHero({ id: "g1", hqSlot: 0 });

    const state = result.state as { hq: (unknown | null)[]; player: { discard: { id: string }[]; recruitPoints: number } };
    expect(state.player.discard.some((c) => c.id === hqCardId)).toBe(true);
    expect(state.hq[0]?.valueOf()).not.toBe(hqCardId);
  });
});

describe("game.fightVillain", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("removes villain from city and adds to victory", async () => {
    const initialState = createInitialState();
    const serialized = JSON.parse(JSON.stringify(initialState));
    serialized.phase = "MAIN";
    serialized.player.attackPoints = 10;
    serialized.city = [{ id: "hydra-soldier", name: "HYDRA Soldier", attackValue: 3, vpValue: 1 }, null, null, null, null];

    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "g1",
      state: serialized,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.game.update).mockResolvedValue({
      id: "g1",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.fightVillain({ id: "g1", cityIndex: 0 });

    const state = result.state as { city: (unknown | null)[]; player: { victory: unknown[]; attackPoints: number } };
    expect(state.city[0]).toBeNull();
    expect(state.player.victory).toHaveLength(1);
    expect(state.player.attackPoints).toBe(7);
  });
});

describe("game.endTurn", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("transitions to VILLAIN_DECK_FLIP and draws 6 cards", async () => {
    const initialState = createInitialState();
    const serialized = JSON.parse(JSON.stringify(initialState));
    serialized.phase = "MAIN";
    serialized.player.hand = [];
    serialized.player.deck = Array.from({ length: 10 }, (_: unknown, i: number) => ({ id: `agent-${i}`, name: "S.H.I.E.L.D. Agent" }));

    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "g1",
      state: serialized,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.game.update).mockResolvedValue({
      id: "g1",
      state: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    const result = await caller.game.endTurn({ id: "g1" });

    const state = result.state as { phase: string; player: { hand: unknown[] } };
    expect(state.phase).toBe("VILLAIN_DECK_FLIP");
    expect(state.player.hand).toHaveLength(6);
  });

  it("rejects mutation when game is already over", async () => {
    const initialState = createInitialState();
    const serialized = JSON.parse(JSON.stringify(initialState));
    serialized.phase = "MAIN";
    serialized.status = "LOST";

    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: "g1",
      state: serialized,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const caller = createCaller({});
    await expect(caller.game.endTurn({ id: "g1" })).rejects.toThrow();
  });
});
