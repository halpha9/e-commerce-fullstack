import { router, protectedProcedure } from "./trpc";
import { z } from "zod";

export const userRouter = router({
  deleteUsers: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;

      return prisma.user.deleteMany({
        where: { id: { in: input } },
      });
    }),
});

export type IServerRouter = typeof userRouter;
