import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@legendary/db";

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
  }),
});

export type AppRouter = typeof appRouter;
