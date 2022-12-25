import { Product } from "@prisma/client";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import { prisma } from "../common/prisma";

type Props = {
  products: Product[];
};

export default function Products({ products }: Props) {
  return (
    <div>
      {products &&
        products.length > 0 &&
        products.map((product) => {
          return (
            <Link key={product.id} passHref href={`/product/${product.id}`}>
              <div>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <p>{product.price}</p>
              </div>
            </Link>
          );
        })}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany({});

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};
