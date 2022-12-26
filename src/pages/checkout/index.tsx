import { Disclosure } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { Product } from "@prisma/client";
import { useBasket } from "../../providers/basket";
import { currency } from "../../utils/formats";
import React from "react";

import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import getStripe from "../../utils/stripe";
import Header from "../../components.tsx/header";

const appearance = {
  theme: "none",
  variables: {
    fontFamily: "Verdana",
    fontLineHeight: "1.5",
    borderRadius: "0",
    colorBackground: "#dfdfdf",
  },
  rules: {
    ".Input": {
      backgroundColor: "#ffffff",
      boxShadow:
        "inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080",
    },
    ".Input--invalid": {
      color: "#DF1B41",
    },
    ".Tab, .Block": {
      boxShadow:
        "inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
    },
    ".Tab:hover": {
      backgroundColor: "#eee",
    },
    ".Tab--selected, .Tab--selected:focus, .Tab--selected:hover": {
      backgroundColor: "#ccc",
    },
  },
};

export default function Checkout() {
  const { products: basketItems, removeItem } = useBasket();
  const [state, setState] = React.useState({
    loading: false,
    clientSecret:
      "pi_3MJKbAFVuKEyBUfo0fLVP1TC_secret_adSIUTbbEFBPUxDKXqKMhyxHl",
    error: "",
  });

  React.useEffect(() => {
    fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.clientSecret, "xx23");
        setState((s) => ({ ...s, clientSecret: data.clientSecret }));
      });
  }, []);

  async function handleOrder(products: Product[]) {
    console.log("xx23 order");

    setState((s) => ({ ...s, loading: true }));
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    }).then((res) => res.json());

    if (res && res.url) {
      window.location.href = res.url;
    } else {
      throw new Error("Error processing payment");
    }
    setState((s) => ({ ...s, loading: false }));
  }

  const discount = { code: "CHEAPSKATE", amount: 10 };
  const subtotal =
    basketItems &&
    basketItems.length > 0 &&
    basketItems
      .map((item) => {
        return item.price;
      })
      .reduce((a, b) => a + b, 0);
  const taxes = subtotal;
  const shipping = 50;

  const total: number = taxes + shipping + subtotal;

  return (
    <div className="p-8 h-full w-screen">
      <main className="lg:flex lg:min-h-full lg:flex-row-reverse lg:overflow-hidden">
        <div className="px-4 py-6 sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-lg">
            <img
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt=""
              className="h-8 w-auto"
            />
          </div>
        </div>

        <h1 className="sr-only">Checkout</h1>

        {/* Mobile order summary */}
        <section
          aria-labelledby="order-heading"
          className="bg-gray-50 px-4 py-6 sm:px-6 lg:hidden"
        >
          <Disclosure as="div" className="mx-auto max-w-lg">
            {({ open }) => (
              <>
                <div className="flex items-center justify-between">
                  <h2
                    id="order-heading"
                    className="text-lg font-medium text-gray-300"
                  >
                    Your Order
                  </h2>
                  <Disclosure.Button className="font-medium text-indigo-600 hover:text-indigo-500">
                    {open ? (
                      <span>Hide full summary</span>
                    ) : (
                      <span>Show full summary</span>
                    )}
                  </Disclosure.Button>
                </div>

                <Disclosure.Panel>
                  <ul
                    role="list"
                    className="divide-y divide-gray-200 border-b border-gray-200"
                  >
                    {basketItems &&
                      basketItems.map((product: Product, index) => (
                        <li
                          key={`${product.id}-${index}`}
                          className="flex space-x-6 py-6"
                        >
                          <img
                            src={product.image!}
                            alt={product.image!}
                            className="h-40 w-40 flex-none rounded-md bg-gray-200 object-cover object-center"
                          />
                          <div className="flex flex-col justify-between space-y-4">
                            <div className="space-y-1 text-sm font-medium">
                              <h3 className="text-gray-300">{product.name}</h3>
                              <p className="text-gray-300">
                                {currency(product.price)}
                              </p>
                              <p className="text-gray-500">Blue</p>
                              <p className="text-gray-500">Medium</p>
                            </div>
                            <div className="flex space-x-4">
                              <div className="flex border-l border-gray-300 pl-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem && removeItem(product)
                                  }
                                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>

                  <form className="mt-10">
                    <label
                      htmlFor="discount-code-mobile"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Discount code
                    </label>
                    <div className="mt-1 flex space-x-4">
                      <input
                        type="text"
                        id="discount-code-mobile"
                        name="discount-code-mobile"
                        className="py-1.5 block w-full bg-base-300 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-base-300 border-gray-800 border px-4 text-sm font-medium text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                      >
                        Apply
                      </button>
                    </div>
                  </form>

                  <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd className="text-gray-300">{currency(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="flex">
                        Discount
                        <span className="ml-2 rounded-full bg-gray-200 py-0.5 px-2 text-xs tracking-wide text-gray-600">
                          {discount.code}
                        </span>
                      </dt>
                      <dd className="text-gray-300">
                        -{currency(discount.amount)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Taxes</dt>
                      <dd className="text-gray-300">{currency(taxes)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Shipping</dt>
                      <dd className="text-gray-300">{currency(shipping)}</dd>
                    </div>
                  </dl>
                </Disclosure.Panel>

                <p className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 text-sm font-medium text-gray-300">
                  <span className="text-base">Total</span>
                  <span className="text-base">{currency(total)}</span>
                </p>
              </>
            )}
          </Disclosure>
        </section>

        {/* Order summary */}
        <section
          aria-labelledby="summary-heading"
          className="hidden w-full max-w-md flex-col rounded-xl lg:flex"
        >
          <h2 id="summary-heading" className="sr-only">
            Order summary
          </h2>

          <ul
            role="list"
            className="flex-auto divide-y divide-gray-200 overflow-y-auto px-6"
          >
            {basketItems &&
              basketItems.map((product: Product, index) => (
                <li
                  key={`${product.id}-${index}`}
                  className="flex space-x-6 py-6"
                >
                  <img
                    src={product.image!}
                    alt={product.image!}
                    className="h-40 w-40 flex-none rounded-md bg-gray-200 object-cover object-center"
                  />
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-1 text-sm font-medium">
                      <h3 className="text-gray-300">{product.name}</h3>
                      <p className="text-gray-300">{currency(product.price)}</p>
                      <p className="text-gray-400">blue</p>
                      <p className="text-gray-400">Medium</p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => removeItem && removeItem(product)}
                        type="button"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>

          <div className="sticky bottom-0 flex-none border-t border-gray-200 p-6">
            <form>
              <label
                htmlFor="discount-code"
                className="block text-sm font-medium text-gray-400"
              >
                Discount code
              </label>
              <div className="mt-1 flex space-x-4">
                <input
                  type="text"
                  id="discount-code"
                  name="discount-code"
                  className="block w-full bg-base-300 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="rounded-md bg-gray-200 p-2 px-4 text-sm font-medium text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                >
                  Apply
                </button>
              </div>
            </form>

            <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-gray-300">{currency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex">
                  Discount
                  <span className="ml-2 rounded-full bg-gray-200 py-0.5 px-2 text-xs tracking-wide text-gray-600">
                    {discount.code}
                  </span>
                </dt>
                <dd className="text-gray-300">-{currency(discount.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Taxes</dt>
                <dd className="text-gray-300">{currency(taxes)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="text-gray-300">{currency(shipping)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-300">
                <dt className="text-base">Total</dt>
                <dd className="text-base">{currency(total)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Checkout form */}
        <section
          aria-labelledby="payment-heading"
          className=" rounded-xl mx-2 sm:mr-10 mr-0 flex-auto overflow-y-auto px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-0 lg:pb-24"
        >
          <div className="mx-auto max-w-lg">
            <div className="hidden pt-10 pb-16 lg:flex items-center space-x-2">
              <span className="sr-only">Your Company</span>
              <img
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
                className="h-8 w-auto"
              />
              <p className="font-semibold text-2xl tracking-wide">Checkout</p>
            </div>

            <Elements
              stripe={getStripe()}
              options={{
                clientSecret: state.clientSecret,
                fonts: [
                  {
                    cssSrc:
                      "https://fonts.googleapis.com/css?family=Montserrat:300,300i,400,500,600",
                  },
                ],
              }}
            >
              <CheckoutForm basketItems={basketItems!} total={total!} />
            </Elements>
          </div>
        </section>
      </main>
    </div>
  );
}

type CheckoutProps = {
  basketItems: Product[];
  total: number;
};

const CheckoutForm = ({ basketItems, total }: CheckoutProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [state, setState] = React.useState({
    loading: false,
    clientSecret: "",
    error: "",
  });

  async function handleSubmit(products: Product[]) {
    setState((s) => ({ ...s, loading: true }));

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          process.env.NODE_ENV === "development"
            ? `http://localhost:3000/dashboard`
            : `https://www.cosmetic.college/enrolment/`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setState((s) => ({ ...s, error: error.message! }));
    } else {
      setState((s) => ({ ...s, error: "An unexpected error occurred." }));
    }
    setState((s) => ({ ...s, loading: false }));
  }

  return (
    <form className="mt-6">
      <PaymentElement />

      <button
        type="button"
        onClick={() => {
          handleSubmit(basketItems!);
        }}
        className="mt-6 w-full rounded-md border border-gray-800 bg-base-300 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Pay {currency(total)}
      </button>

      <p className="mt-6 flex justify-center text-sm font-medium text-gray-500">
        <LockClosedIcon
          className="mr-1.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        Payment details stored in plain text
      </p>
    </form>
  );
};
