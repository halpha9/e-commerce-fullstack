import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const event = req.body;
  const webhookSecret = process.env.NEXT_STRIPE_WEBHOOK_BOOKING_FEE!;
  const sig = event?.headers["stripe-signature"];

  const stripeEvent = stripe.webhooks.constructEvent(
    event.body,
    sig,
    webhookSecret
  );

  const stripeData = stripeEvent.data.object;
}
