import { HomeIcon } from "@heroicons/react/24/outline";
import { Order, OrderProduct, Product } from "@prisma/client";
import { format, parseISO } from "date-fns";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import Stripe from "stripe";
import { prisma } from "../../common/prisma";
import { classNames } from "../../utils/classNames";
import { currency } from "../../utils/formats";

type Props = {
  order: Order & {
    product: (OrderProduct & {
      product: Product;
    })[];
  };
};

export default function Thanks({ order }: Props) {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="w-full">
          <h1 className="text-5xl font-bold">Thank You</h1>
          <p className="py-6">Thank You For Placing An Order</p>
          <div className="flex items-center space-x-2 rounded-lg border border-gray-700 bg-base-300 p-4 text-gray-400">
            <p className="font-semibold text-gray-300">Order ID: </p>
            <p>{order.id}</p>
          </div>
          {order.product &&
            order.product.length > 0 &&
            order.product.map((product) => (
              <div
                key={product.id}
                className=" my-4 border-gray-700 bg-base-300 shadow-sm sm:rounded-lg sm:border"
              >
                <div className="py-6 px-4 sm:px-6  lg:p-8">
                  <div className="sm:flex lg:col-span-7">
                    <div className="aspect-w-1 aspect-h-1 sm:aspect-none w-full flex-shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-40">
                      {product.product.image && (
                        <img
                          src={product.product.image}
                          alt={product.product.image}
                          className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                        />
                      )}
                    </div>

                    <div className="mt-6 sm:mt-0 sm:ml-6">
                      <h3 className="text-base font-medium text-gray-400">
                        <Link passHref href={`product/${product.product.id}`}>
                          {product.product.name}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm font-medium text-gray-400">
                        {currency(product.product.price)}
                      </p>
                      <p className="mt-3 text-sm text-gray-300">
                        {product.product.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 py-6 px-4 sm:px-6 lg:p-8">
                  <h4 className="sr-only">Status</h4>
                  <p className="text-sm font-medium text-gray-400">
                    {order.status} on{" "}
                    <div>
                      {format(parseISO(product.createdAt.toString()), "PPPpp")}
                    </div>
                  </p>
                  <div className="mt-6" aria-hidden="true">
                    <div className="overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-secondary"
                        style={{
                          width: `calc((${0} * 2 + 1) / 8 * 100%)`,
                        }}
                      />
                    </div>
                    <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
                      <div className="text-secondary">Order placed</div>
                      <div
                        className={classNames(
                          0 > 0 ? "text-secondary" : "",
                          "text-center"
                        )}
                      >
                        Processing
                      </div>
                      <div
                        className={classNames(
                          0 > 1 ? "text-secondary" : "",
                          "text-center"
                        )}
                      >
                        Shipped
                      </div>
                      <div
                        className={classNames(
                          0 > 2 ? "text-secondary" : "",
                          "text-right"
                        )}
                      >
                        Delivered
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          <Link href="/" passHref className="btn btn-secondary my-8">
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
      product: {
        include: {
          product: true,
        },
      },
    },
  });

  return {
    props: {
      order: JSON.parse(JSON.stringify(order)),
    },
  };
};
