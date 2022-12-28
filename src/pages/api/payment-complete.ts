import Stripe from "stripe";
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import { trpc } from "../../common/trpc";
import { prisma } from "../../common/prisma";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});
const webhookSecret = process.env.NEXT_STRIPE_WEBHOOK!;

export const config = {
  api: {
    bodyParser: false,
  },
};
interface ReturnEvent extends Stripe.Event {
  data: {
    object: {
      id: string;
      amount: number;
      metadata: {
        orderId: string;
      };
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const buf = await buffer(req);
  const sig = req?.headers["stripe-signature"]!;

  let stripeEvent: ReturnEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      buf,
      sig,
      webhookSecret
    ) as ReturnEvent;

    setTimeout(() => {
      res.json({ received: true, stripeEvent: stripeEvent });
    }, 2000);

    const order = await prisma.order.findUnique({
      where: {
        id: stripeEvent.data.object.metadata.orderId,
      },
    });

    const result = await prisma.payment.create({
      data: {
        stripeId: stripeEvent.data.object.id,
        amount: stripeEvent.data.object.amount,
        orderId: stripeEvent.data.object.metadata.orderId,
        currency: "gbp",
        userId: order?.userId,
      },
    });

    await prisma.order.update({
      where: { id: stripeEvent.data.object.metadata.orderId },
      data: {
        status: "COMPLETE",
        paymentId: result.id,
      },
    });

    await prisma.order.update({
      where: {
        id: stripeEvent.data.object.metadata.orderId,
      },
      data: {
        paymentId: result.id,
      },
    });
  } catch (err) {
    //@ts-ignore
    res.status(400).send(`Webhook Error: ${err?.message}`);
    return;
  }
}
