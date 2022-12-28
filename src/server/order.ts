import { protectedProcedure, publicProcedure, router } from "./trpc";
import { z } from "zod";
import { Order } from "@prisma/client";

export const orderRouter = router({
  addOrder: publicProcedure
    .input(
      z.object({
        products: z.array(z.object({ id: z.string(), quantity: z.number() })),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma, session } = ctx;

      const { products } = input;

      let userId;

      if (session) {
        userId = session.user.userId;
      }

      let result: Order;

      if (userId) {
        result = await prisma.order.create({
          data: { userId, metadata: JSON.stringify(products) },
        });
      } else {
        result = await prisma.order.create({
          data: { metadata: JSON.stringify(products) },
        });
      }

      const orderProduct = products.map((product) => {
        return {
          quantity: product.quantity,
          productId: product.id,
          orderId: result.id,
        };
      });

      const res = await orderProduct.map((orderProduct) => {
        prisma.orderProduct.create({
          data: orderProduct,
        });
      });

      return {
        status: 201,
        message: "Order Added Successfully",
        result: result,
        orderProduct: res,
      };
    }),
  addPayment: publicProcedure
    .input(
      z.object({
        stripeId: z.string(),
        amount: z.number(),
        orderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma, session } = ctx;
      const { stripeId, amount, orderId } = input;
      const currency = "gbp";

      let userId;

      if (session) {
        userId = session.user.userId;
      }

      const result = await prisma.payment.create({
        data: {
          stripeId,
          amount,
          currency,
          orderId,
          userId,
        },
      });

      return {
        status: 201,
        result: result,
        message: "Payment Added Successfully",
      };
    }),
  completeOrder: publicProcedure
    .input(
      z.object({
        id: z.string(),
        paymentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;
      const { id, paymentId } = input;

      const result = await prisma.order.update({
        where: { id },
        data: {
          status: "COMPLETE",
          paymentId,
        },
      });

      return {
        status: 201,
        result: result,
        message: "Order Completed Successfully",
      };
    }),
});

export type IServerRouter = typeof orderRouter;
