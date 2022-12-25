import type { GetServerSideProps, NextPage } from "next";
import { useSession, signOut } from "next-auth/react";

import { requireAuth } from "../../common/requireAuth";
import { trpc } from "../../common/trpc";
import { prisma } from "../../common/prisma";
import { Order, Product, User } from "@prisma/client";
import { useRouter } from "next/router";

type Props = {
  products: Product[];
  orders: Order[];
  customers: User[];
  staff: User[];
};

const Dashboard = ({ products, orders, staff, customers }: Props) => {
  const { data: SessionData } = useSession();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.product.listProducts.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-lg">
          <h1 className="text-5xl text-center font-bold leading-snug text-gray-400">
            You are logged in!
          </h1>
          <p className="my-4 text-center leading-loose">
            You are allowed to visit this page because you have a session,
            otherwise you would be redirected to the login page.
          </p>
          <div className="my-4 bg-gray-700 rounded-lg p-4">
            <pre>
              <code>{JSON.stringify(SessionData, null, 2)}</code>
            </pre>
          </div>
          <div className="text-center">
            <button
              className="btn btn-secondary"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = requireAuth(async () => {
  const products = await prisma.product.findMany({});
  const orders = await prisma.order.findMany({});
  const customers = await prisma.user.findMany({ where: { role: "USER" } });
  const staff = await prisma.user.findMany({ where: { role: "OWNER" } });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      orders: JSON.parse(JSON.stringify(orders)),
      customers: JSON.parse(JSON.stringify(customers)),
      staff: JSON.parse(JSON.stringify(staff)),
    },
  };
});
