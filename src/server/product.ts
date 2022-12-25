import { publicProcedure, router } from "./trpc";
import { productSchema } from "../common/validation/product";
import { z } from "zod";

export const productRouter = router({
  listProducts: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { prisma } = ctx;

      const { limit, cursor } = input;

      const products = await prisma.product.findMany({
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (products.length > limit) {
        const nextItem = products.pop() as typeof products[number];

        nextCursor = nextItem.id;
      }

      return {
        products,
        nextCursor,
      };
    }),
  getProductById: publicProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { prisma } = ctx;
      const { productId } = input;

      return prisma.product.findUnique({
        where: { id: productId },
      });
    }),
});

export type IServerRouter = typeof productRouter;
