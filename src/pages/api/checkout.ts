import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Product } from "@prisma/client";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { products } = req.body;

    const data: Product[] = products;
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = data.map(
      (product) => {
        const priceData = {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: product.price,
            product_data: {
              name: product.name,
              description: product.description,
              images: [`${product.image}`],
            },
          },
        };
        return priceData;
      }
    );

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      success_url: `https://http://localhost:3000/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://http://localhost:3000/?cancelled=true`,
      currency: "gbp",
      mode: "payment",
      submit_type: "book",
      phone_number_collection: {
        enabled: true,
      },
      after_expiration: {
        recovery: {
          enabled: true,
        },
      },
      line_items,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    return res.status(404).json({
      error: "error",
    });
  }
}
