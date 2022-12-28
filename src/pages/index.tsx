import type { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { prisma } from "../common/prisma";
import type { Product } from "@prisma/client";
import { currency } from "../utils/formats";

const perks = [
  {
    name: "Free returns",
    imageUrl:
      "https://tailwindui.com/img/ecommerce/icons/icon-returns-light.svg",
    description:
      "Not what you expected? Place it back in the parcel and attach the pre-paid postage stamp.",
  },
  {
    name: "Same day delivery",
    imageUrl:
      "https://tailwindui.com/img/ecommerce/icons/icon-calendar-light.svg",
    description:
      "We offer a delivery service that has never been done before. Checkout today and receive your products within hours.",
  },
  {
    name: "All year discount",
    imageUrl:
      "https://tailwindui.com/img/ecommerce/icons/icon-gift-card-light.svg",
    description:
      'Looking for a deal? You can use the code "ALLYEAR" at checkout and get money off all year round.',
  },
  {
    name: "For the planet",
    imageUrl:
      "https://tailwindui.com/img/ecommerce/icons/icon-planet-light.svg",
    description:
      "We’ve pledged 1% of sales to the preservation and restoration of the natural environment.",
  },
];

type Props = {
  products: Product[];
};
const Home = ({ products }: Props) => {
  return (
    <div className="min-h-screen bg-base-100">
      <main>
        <section aria-labelledby="trending-heading">
          <div className="mx-auto max-w-7xl py-24 px-4 sm:px-6 sm:py-24 lg:px-8 lg:pt-12">
            <div className="md:flex md:items-center md:justify-between">
              <h2
                id="favorites-heading"
                className="text-2xl font-bold tracking-tight text-gray-300"
              >
                Trending Products
              </h2>
              <Link
                href="/products"
                passHref
                className="hidden text-sm font-medium text-secondary hover:text-secondary-focus md:block"
              >
                Shop the collection
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
              {products &&
                products.map((product) => (
                  <div key={product.id} className="group relative">
                    <div className="h-56 w-full overflow-hidden rounded-md group-hover:opacity-75 lg:h-72 xl:h-80">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.image}
                          sizes="100vw"
                          style={{
                            width: "100%",
                            height: "auto",
                          }}
                          width={700}
                          height={400}
                          className="h-full w-full rounded-md object-cover object-center"
                        />
                      )}
                    </div>
                    <h3 className="mt-4 text-sm text-gray-300">
                      <a href={`/product/${product.id}`}>
                        <span className="absolute inset-0" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-300">
                      {currency(product.price)}
                    </p>
                  </div>
                ))}
            </div>

            <div className="mt-8 text-sm md:hidden">
              <Link
                href="/products"
                className="font-medium text-secondary hover:text-secondary-focus"
              >
                Shop the collection
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="perks-heading"
          className="border-t border-base-300"
        >
          <h2 id="perks-heading" className="sr-only">
            Our perks
          </h2>

          <div className="mx-auto max-w-7xl py-24 px-4 sm:px-6 sm:py-44 lg:px-8">
            <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
              {perks.map((perk) => (
                <div
                  key={perk.name}
                  className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
                >
                  <div className="md:flex-shrink-0">
                    <div className="flow-root">
                      <Image
                        src={perk.imageUrl}
                        alt=""
                        sizes="100vw"
                        style={{
                          width: "100%",
                          height: "auto",
                        }}
                        width={700}
                        height={250}
                        className="-my-1 mx-auto h-24 w-auto"
                      />
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 md:ml-4 lg:mt-6 lg:ml-0">
                    <h3 className="text-base font-medium text-gray-200">
                      {perk.name}
                    </h3>
                    <p className="mt-3 text-sm text-gray-400">
                      {perk.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany({
    take: 4,
    skip: 1,
    orderBy: [{ createdAt: "asc" }],
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};
