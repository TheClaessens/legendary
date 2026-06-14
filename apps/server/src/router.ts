import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@legendary/db";
import { createInitialState, flipVillainDeck, playCard, recruitHero, fightVillain, fightMastermind, endTurn, applyStatusChecks, hydrateState } from "@legendary/game-engine";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

async function loadAndMutate(
  gameId: string,
  mutate: (state: ReturnType<typeof hydrateState>) => ReturnType<typeof hydrateState>,
) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new TRPCError({ code: "NOT_FOUND" });
  const state = hydrateState(game.state as Record<string, unknown>);
  if (state.status !== "IN_PROGRESS") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Game is already over" });
  }
  let newState;
  try {
    newState = mutate(state);
  } catch (err) {
    throw new TRPCError({ code: "BAD_REQUEST", message: (err as Error).message });
  }
  newState = applyStatusChecks(newState);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const serialized = JSON.parse(JSON.stringify(newState));
  await prisma.game.update({ where: { id: gameId }, data: { state: serialized } });
  return { id: gameId, state: serialized };
}

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  game: router({
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) =>
        prisma.game.findUnique({ where: { id: input.id } })
      ),
    create: publicProcedure.mutation(async () => {
      const state = createInitialState();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const serialized = JSON.parse(JSON.stringify(state));
      const game = await prisma.game.create({ data: { state: serialized } });
      return { id: game.id, state: serialized };
    }),
    flipVillainDeck: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => loadAndMutate(input.id, (s) => flipVillainDeck(s))),
    playCard: publicProcedure
      .input(z.object({ id: z.string(), cardId: z.string() }))
      .mutation(({ input }) => loadAndMutate(input.id, (s) => playCard(s, input.cardId))),
    recruitHero: publicProcedure
      .input(z.object({ id: z.string(), hqSlot: z.number().int().min(0).max(4) }))
      .mutation(({ input }) => loadAndMutate(input.id, (s) => recruitHero(s, input.hqSlot))),
    fightVillain: publicProcedure
      .input(z.object({ id: z.string(), cityIndex: z.number().int().min(0).max(4) }))
      .mutation(({ input }) => loadAndMutate(input.id, (s) => fightVillain(s, input.cityIndex))),
    fightMastermind: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => loadAndMutate(input.id, (s) => fightMastermind(s))),
    endTurn: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => loadAndMutate(input.id, (s) => endTurn(s))),
  }),
});

export type AppRouter = typeof appRouter;
