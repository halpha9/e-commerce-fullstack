import { publicProcedure, router } from "./trpc";
import { z } from "zod";

export const orderRouter = router({
  addOrder: publicProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
        paymentId: z.string(),
        address: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma, session } = ctx;

      const { productIds, address, paymentId } = input;

      let userId;

      if (session) {
        userId = session.user.userId;
      }

      if (userId) {
        const result = await prisma.order.create({
          data: { address, paymentId, userId },
        });
      }

      const result = await prisma.order.create({
        data: { address, paymentId },
      });

      let res;

      if (result) {
        const orderProduct = productIds.map((productId) => {
          return {
            productId,
            orderId: result.id,
          };
        });
        res = await orderProduct.map((orderProduct) => {
          prisma.orderProduct.create({
            data: orderProduct,
          });
        });
      }

      return {
        status: 201,
        message: "Order Added Successfully",
        result: result,
        orderProduct: res,
      };
    }),
});

export type IServerRouter = typeof orderRouter;
