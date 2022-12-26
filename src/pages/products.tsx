import { StarIcon } from "@heroicons/react/20/solid";
import { Product } from "@prisma/client";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import { prisma } from "../common/prisma";
import { useBasket } from "../providers/basket";
import { classNames } from "../utils/classNames";
import { currency } from "../utils/formats";

type Props = {
  products: Product[];
};

export default function Products({ products }: Props) {
  const { addItem } = useBasket();
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {products &&
            products.length > 0 &&
            products.map((product) => (
              <div key={product.id}>
                <div className="relative">
                  <Link href={`product/${product.id}`}>
                    <div className="relative h-72 w-full overflow-hidden rounded-lg">
                      <img
                        src={product.image!}
                        alt={product.image!}
                        className="h-full w-full object-cover object-center hover:opacity-40 transition-all"
                      />
                    </div>
                  </Link>
                  <div className="relative mt-4">
                    <Link href={`product/${product.id}`}>
                      <h3 className="text-sm font-medium text-gray-900">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 truncate opacity-40">
                      {product.description}
                    </p>
                  </div>
                  <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50"
                    />
                    <p className="relative text-lg font-semibold text-white">
                      {currency(product.price)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 justify-center w-full flex">
                  <button
                    onClick={() => addItem && addItem(product)}
                    className="bg-base-300 border relative flex items-center justify-center rounded-md bg-gray-100 py-2 px-8 text-sm font-medium text-gray-900 hover:bg-gray-200"
                  >
                    Add to bag<span className="sr-only">, {product.name}</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany({
    take: 12,
    skip: 1, // Skip the cursor
    orderBy: [{ createdAt: "desc" }],
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};
