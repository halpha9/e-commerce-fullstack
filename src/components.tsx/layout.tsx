import { useSession } from "next-auth/react";
import React from "react";
import Footer from "./footer";
import Header from "./header";

function Layout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  return (
    <>
      {status !== "loading" ? (
        <div>
          {status === "authenticated" && <Header />}
          <div>{children}</div>
          <Footer />
        </div>
      ) : (
        <div className="flex-1 bg-slate-900 w-screen h-screen items-center justify-center"></div>
      )}
    </>
  );
}

export default Layout;
