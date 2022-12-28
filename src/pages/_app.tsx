import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import Layout from "../components/Layout";
import BasketProvider from "../providers/basket";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <BasketProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </BasketProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
