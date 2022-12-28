import React, { useMemo } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { currency } from "../utils/formats";
import type { Product } from "@prisma/client";
import { trpc } from "../common/trpc";
import { useBasket } from "../providers/basket";

type Props = {
  total: number;
  products: Product[];
  intentId: string;
};

type State = {
  message: string | undefined;
  loading: boolean;
};

export default function CheckoutForm({ total, products, intentId }: Props) {
  const { clearBasket } = useBasket();
  const { mutateAsync } = trpc.order.addOrder.useMutation();

  const stripe = useStripe();
  const elements = useElements();

  const [state, setState] = React.useState<State>({
    message: undefined,
    loading: false,
  });

  React.useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent!.status) {
        case "succeeded":
          setState((s) => ({ ...s, message: "Payment succeeded!" }));
          break;
        case "processing":
          setState((s) => ({ ...s, message: "Your payment is processing." }));
          break;
        case "requires_payment_method":
          setState((s) => ({
            ...s,
            message: "Your payment was not successful, please try again.",
          }));
          break;
        default:
          setState((s) => ({ ...s, message: "Something went wrong" }));
          break;
      }
    });
  }, [stripe]);

  const productArr = useMemo(
    () =>
      products &&
      products.map((product) => {
        return {
          id: product.id,
          quantity: product.quantity,
        };
      }),
    [products]
  );

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const orderResult = await mutateAsync({ products: productArr });
      const res = await fetch("/api/update-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total,
          products: JSON.stringify(productArr),
          intentId,
          orderId: orderResult.result.id,
        }),
      });

      if (res) {
        if (!stripe || !elements) {
          return;
        }

        setState((s) => ({ ...s, loading: true }));

        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${
              process.env.NODE_ENV === "development"
                ? process.env.NEXT_PUBLIC_DEV_URL!
                : process.env.NEXT_PUBLIC_VERCEL_URL!
            }/thanks/${orderResult.result.id}`,
          },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
          setState((s) => ({ ...s, message: error.message }));
        } else {
          setState((s) => ({ ...s, message: "An unexpected error occurred." }));
        }
      }
      clearBasket && clearBasket();
    } catch (err) {
      console.log(err);
    }

    setState((s) => ({ ...s, loading: false }));
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
  };

  return (
    <div className="mx-auto max-w-lg lg:pt-16">
      <form id="payment-form" onSubmit={handleSubmit}>
        <LinkAuthenticationElement id="link-authentication-element" />
        <PaymentElement id="payment-element" options={paymentElementOptions} />
        {products && products.length > 0 && (
          <button
            type="submit"
            disabled={state.loading || !stripe || !elements}
            className="mt-6 w-full rounded-md border border-gray-800 bg-base-300 py-2 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Pay {currency(total)}
          </button>
        )}
        {state.message && <div id="payment-message">{state.message}</div>}
      </form>
      <div className="card my-8 w-[500] border border-base-100 bg-base-200 shadow-md">
        <div className="card-body w-full items-center">
          <div className="h-max w-max select-none">
            <div className="recto z-2 relative flex h-56 w-96 flex-col justify-end gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-800 to-blue-900 px-8 py-6 text-white shadow-md">
              <div className="logo absolute top-6 right-8 flex h-8 w-16 items-center justify-items-center">
                <svg viewBox="0 0 1000 324.68">
                  <path
                    d="m651.19 0.5c-70.933 0-134.32 36.766-134.32 104.69 0 77.9 112.42 83.281 112.42 122.42 0 16.478-18.884 31.229-51.137 31.229-45.773 0-79.984-20.611-79.984-20.611l-14.638 68.547s39.41 17.41 91.734 17.41c77.552 0 138.58-38.571 138.58-107.66 0-82.316-112.89-87.536-112.89-123.86 0-12.908 15.502-27.052 47.663-27.052 36.287 0 65.892 14.99 65.892 14.99l14.326-66.204s-32.213-13.897-77.642-13.897zm-648.97 4.9966-1.7176 9.9931s29.842 5.4615 56.719 16.356c34.607 12.493 37.072 19.765 42.9 42.354l63.511 244.83h85.137l131.16-313.53h-84.942l-84.278 213.17-34.39-180.7c-3.1539-20.681-19.129-32.478-38.684-32.478h-135.41zm411.87 0-66.634 313.53h80.999l66.4-313.53h-80.765zm451.76 0c-19.532 0-29.88 10.457-37.474 28.73l-118.67 284.8h84.942l16.434-47.467h103.48l9.9931 47.467h74.948l-65.385-313.53h-68.273zm11.047 84.707 25.178 117.65h-67.454l42.276-117.65z"
                    fill="#fff"
                  />
                </svg>
              </div>

              <div className="pin h-7 w-11 rounded bg-yellow-100">&nbsp;</div>

              <div className="number whitespace-nowrap text-2xl font-semibold">
                4242&nbsp;4242&nbsp;4242&nbsp;4242
              </div>

              <div className="credentials flex gap-8">
                <div className="owner flex w-max flex-col">
                  <span className="text-xs uppercase">Card holder</span>
                  <span className="whitespace-nowrap text-lg">John Doe</span>
                </div>
                <div className="expires flex w-max flex-col">
                  <span className="text-xs uppercase">Expires</span>
                  <span className="whitespace-nowrap text-lg">09/23</span>
                </div>
                <div className="cvc flex w-max flex-col">
                  <span className="text-xs uppercase">cvv</span>
                  <span className="whitespace-nowrap text-lg">456</span>
                </div>
              </div>
            </div>
          </div>
          <p className="pt-4 text-center opacity-70">
            This Checkout, uses Stripe In Test Mode Use the Card Details Above
            To Simulate An Order
          </p>
        </div>
      </div>
    </div>
  );
}
