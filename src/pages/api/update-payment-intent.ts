import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { total, products, intentId, orderId } = req.body;

  const paymentIntent = await stripe.paymentIntents.update(intentId, {
    amount: total,
    currency: "gbp",
    metadata: { products, orderId },
  });

  res.send({
    total,
    products,
    intentId,
  });
}
