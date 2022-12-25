import { useSession } from "next-auth/react";
import React from "react";
import Header from "./header";

function Layout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  console.log(status);
  return (
    <>
      {status !== "loading" ? (
        <>
          <div className="fixed inset-0 flex-1 flex flex-col transition-all z-0 overflow-hidden outline-none">
            {status === "authenticated" && <Header />}
            <div className={"relative flex-1 overflow-y-scroll"}>
              {children}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 bg-slate-900 w-screen h-screen items-center justify-center"></div>
      )}
    </>
  );
}

export default Layout;
