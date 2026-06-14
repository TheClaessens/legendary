import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@legendary/db";
import { createInitialState, flipVillainDeck, playCard, hydrateState } from "@legendary/game-engine";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

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
      .mutation(async ({ input }) => {
        const game = await prisma.game.findUnique({ where: { id: input.id } });
        if (!game) throw new TRPCError({ code: "NOT_FOUND" });
        const state = hydrateState(game.state as Record<string, unknown>);
        const newState = flipVillainDeck(state);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const serialized = JSON.parse(JSON.stringify(newState));
        await prisma.game.update({ where: { id: input.id }, data: { state: serialized } });
        return { id: input.id, state: serialized };
      }),
    playCard: publicProcedure
      .input(z.object({ id: z.string(), cardId: z.string() }))
      .mutation(async ({ input }) => {
        const game = await prisma.game.findUnique({ where: { id: input.id } });
        if (!game) throw new TRPCError({ code: "NOT_FOUND" });
        const state = hydrateState(game.state as Record<string, unknown>);
        let newState;
        try {
          newState = playCard(state, input.cardId);
        } catch (err) {
          throw new TRPCError({ code: "BAD_REQUEST", message: (err as Error).message });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const serialized = JSON.parse(JSON.stringify(newState));
        await prisma.game.update({ where: { id: input.id }, data: { state: serialized } });
        return { id: input.id, state: serialized };
      }),
  }),
});

export type AppRouter = typeof appRouter;
