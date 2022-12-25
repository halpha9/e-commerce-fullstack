import "../styles/globals.css";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../common/trpc";
import BasketProvider from "../providers/basket";
import Layout from "../components.tsx/layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface CustomAppProps extends AppProps {
  pageProps: {
    session?: Session;
  } & AppProps["pageProps"];
}

const CustomApp = ({ Component, pageProps }: CustomAppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <BasketProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </BasketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(CustomApp);
