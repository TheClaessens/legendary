import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@legendary/db";
import { createInitialState } from "@legendary/game-engine";

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
  }),
});

export type AppRouter = typeof appRouter;
