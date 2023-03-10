import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { total, products } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    payment_method_types: ["card"],
    amount: total || 100,
    metadata: { products },
    currency: "gbp",
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    id: paymentIntent.id,
  });
}
