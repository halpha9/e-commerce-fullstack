import { HomeIcon } from "@heroicons/react/24/outline";
import { Order } from "@prisma/client";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import Stripe from "stripe";
import { prisma } from "../../common/prisma";

type Props = {
  order: Order;
};

export default function Thanks({ order }: Props) {
  console.log(order, "xx23");
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Thank You</h1>
          <p className="py-6">Thank You For Placing An Order</p>
          <Link href="/" passHref className="btn btn-primary">
            <div className="flex items-center space-x-2">
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  query,
}) => {
  const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15",
  });

  const { id } = params as { id: string };
  let { payment_intent, redirect_status, payment_intent_client_secret } =
    query as {
      session_id: string;
      payment_intent: string;
      redirect_status: string;
      payment_intent_client_secret: string;
    };

  if (redirect_status && redirect_status === "failed") {
    return {
      redirect: {
        destination: "/booking/?status=failed",
        permanent: false,
      },
    };
  }

  let loadedPaymentIntent: Stripe.PaymentIntent;
  let orderData = null;
  let sessionData = null;

  if (payment_intent) {
    try {
      loadedPaymentIntent = await stripe.paymentIntents.retrieve(
        payment_intent
      );
    } catch (err) {
      console.log(err);
    }

    if (
      loadedPaymentIntent!.status === "requires_payment_method" ||
      loadedPaymentIntent!.status === "requires_action"
    ) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  }

  const order = await prisma.order.findUnique({
    where: {
      id: id,
    },
    include: {
      product: true,
    },
  });

  return {
    props: {
      order: JSON.parse(JSON.stringify(order)),
    },
  };
};
