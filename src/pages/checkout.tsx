import React, { useMemo } from "react";
import { Disclosure } from "@headlessui/react";
import { currency } from "../utils/formats";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import { useBasket } from "../providers/basket";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY!);

export default function Checkout() {
  const { total, shipping, taxes, subtotal, products, removeItem } =
    useBasket();
  const [clientSecret, setClientSecret] = React.useState("");
  const [paymentId, setPaymentId] = React.useState("");

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

  React.useEffect(() => {
    if (productArr && productArr) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total, products: JSON.stringify(productArr) }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setPaymentId(data.id);
        });
    }
  }, [productArr]);

  const appearance: { theme: "night" } = {
    theme: "night",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen w-full">
      <main className="lg:flex lg:min-h-full lg:flex-row-reverse lg:overflow-hidden lg:py-10 lg:px-10">
        <h1 className="sr-only">Checkout</h1>

        {/* Mobile order summary */}

        <section
          aria-labelledby="order-heading"
          className="bg-base-100 px-4 py-6 sm:px-6 lg:hidden"
        >
          <Disclosure as="div" className="mx-auto max-w-lg">
            {({ open }) => (
              <>
                {products && products.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2
                        id="order-heading"
                        className="text-lg font-medium text-gray-400"
                      >
                        Your Order
                      </h2>
                      <Disclosure.Button className="font-medium text-secondary transition-all hover:text-secondary-focus">
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
                        {products &&
                          products.length > 0 &&
                          products.map((product) => (
                            <li
                              key={product.id}
                              className="flex space-x-6 py-6"
                            >
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.image}
                                  className="h-40 w-40 flex-none rounded-md bg-gray-200 object-cover object-center"
                                />
                              )}
                              <div className="flex flex-col justify-between space-y-4">
                                <div className="space-y-1 text-sm font-medium">
                                  <h3 className="text-gray-300">
                                    {product.name}
                                  </h3>
                                  <h3 className="text-gray-300">
                                    Quantity: {product.quantity}
                                  </h3>
                                  <p className="text-gray-400">
                                    {currency(product.price)}
                                  </p>
                                </div>
                                <div className="flex">
                                  <button
                                    onClick={() =>
                                      removeItem && removeItem(product)
                                    }
                                    type="button"
                                    className="text-sm font-medium text-secondary transition-all hover:text-secondary-focus"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>

                      <dl className="mt-10 space-y-6 text-sm font-medium text-gray-300">
                        {subtotal && subtotal > 0 && (
                          <div className="flex justify-between">
                            <dt>Subtotal</dt>
                            <dd className="text-gray-400">
                              {currency(subtotal)}
                            </dd>
                          </div>
                        )}
                        {taxes && taxes > 0 && (
                          <div className="flex justify-between">
                            <dt>Taxes</dt>
                            <dd className="text-gray-400">{currency(taxes)}</dd>
                          </div>
                        )}
                        {shipping && (
                          <div className="flex justify-between">
                            <dt>Shipping</dt>
                            <dd className="text-gray-400">
                              {currency(shipping)}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </Disclosure.Panel>

                    <p className="mt-6 flex items-center justify-between  pt-6 text-sm font-medium text-gray-400">
                      <span className="text-base">Total</span>
                      {total && (
                        <span className="text-base">{currency(total)}</span>
                      )}
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-300">
                      No Items
                    </h3>
                  </div>
                )}
              </>
            )}
          </Disclosure>
        </section>

        {/* Order summary */}
        <section
          aria-labelledby="summary-heading"
          className="hidden w-full max-w-md flex-col rounded-xl border border-base-200 bg-base-200 shadow-md lg:flex"
        >
          {products && products.length > 0 ? (
            <>
              <h2 id="summary-heading" className="sr-only">
                Order summary
              </h2>

              <ul
                role="list"
                className="flex-auto divide-y divide-gray-200 overflow-y-auto px-6"
              >
                {products &&
                  products.length > 0 &&
                  products.map((product) => (
                    <li key={product.id} className="flex space-x-6 py-6">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.image}
                          className="h-40 w-40 flex-none rounded-md bg-gray-200 object-cover object-center"
                        />
                      )}
                      <div className="flex flex-col justify-between space-y-4">
                        <div className="space-y-1 text-sm font-medium">
                          <h3 className="text-gray-300">{product.name}</h3>
                          <h3 className="text-gray-300">
                            Quantity: {product.quantity}
                          </h3>
                          <p className="text-gray-400">
                            {currency(product.price)}
                          </p>
                        </div>
                        <div className="flex">
                          <button
                            onClick={() => removeItem && removeItem(product)}
                            type="button"
                            className="text-sm font-medium text-secondary transition-all hover:text-secondary-focus"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>

              <div className="sticky bottom-0 flex-none rounded-lg  bg-base-200 p-6">
                <dl className="mt-10 space-y-6 text-sm font-medium text-gray-300">
                  {subtotal && (
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd className="text-gray-400">{currency(subtotal)}</dd>
                    </div>
                  )}
                  {taxes && (
                    <div className="flex justify-between">
                      <dt>Taxes</dt>
                      <dd className="text-gray-400">{currency(taxes)}</dd>
                    </div>
                  )}
                  {shipping && (
                    <div className="flex justify-between">
                      <dt>Shipping</dt>
                      <dd className="text-gray-400">{currency(shipping)}</dd>
                    </div>
                  )}
                  {total && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-400">
                      <dt>Total</dt>
                      <dd className="text-base">{currency(total)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center">
              <div>
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">
                  No Items
                </h3>
              </div>
            </div>
          )}
        </section>

        {/* Checkout form */}
        <section
          aria-labelledby="payment-heading"
          className="flex-auto overflow-y-auto px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-0 lg:pb-24"
        >
          {clientSecret && products && total && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm
                total={total}
                products={products!}
                intentId={paymentId}
              />
            </Elements>
          )}
        </section>
      </main>
    </div>
  );
}
