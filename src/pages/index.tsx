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
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute hidden h-full w-1/2 bg-base-300 lg:block"
          />
          <div className="relative bg-base-300 lg:bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:px-8">
              <div className="mx-auto max-w-2xl py-24 lg:max-w-none lg:py-64">
                <div className="lg:pr-16">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-400 sm:text-5xl xl:text-6xl">
                    Focus on what matters
                  </h1>
                  <p className="mt-4 text-xl text-gray-300">
                    All the charts, datepickers, and notifications in the world
                    can&apos;t beat checking off some items on a paper card.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/products"
                      className="inline-block rounded-md border border-transparent bg-secondary py-3 px-8 font-semibold text-gray-800 hover:bg-secondary-focus"
                    >
                      Shop Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-48 w-full sm:h-64 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-1/2">
            <img
              src="https://tailwindui.com/img/ecommerce-images/home-page-02-hero-half-width.jpg"
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
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
                        <img
                          src={product.image}
                          alt={product.image}
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
          className="border-t border-base-300 bg-base-300"
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
