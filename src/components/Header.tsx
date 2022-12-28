import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useBasket } from "../providers/basket";
import { currency } from "../utils/formats";

export default function Header() {
  const router = useRouter();
  const { quantity, total } = useBasket();
  const { data, status } = useSession();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, []);

  return (
    <div className="navbar z-20 border-b border-base-300 bg-base-200">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl normal-case">
          Ecommerce
        </Link>
      </div>
      <div className="flex-1">
        <Link href="/products" className="btn btn-ghost text-lg normal-case">
          Products
        </Link>
      </div>
      <div className="flex-none">
        <div className="dropdown-end dropdown">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <div className="indicator">
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="badge badge-sm indicator-item">{quantity}</span>
            </div>
          </label>
          <div
            tabIndex={0}
            className="card-compact card dropdown-content mt-3 w-52 bg-base-100 shadow"
          >
            <div className="card-body">
              <span className="text-lg font-bold">{quantity} Items</span>
              <span className="text-info">Subtotal: {currency(total!)}</span>
              <div className="card-actions">
                <Link href="/checkout" passHref>
                  <button className="btn btn-secondary btn-block">
                    View cart
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {status === "authenticated" && (
          <div className="dropdown-end dropdown">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <UserIcon className="h-6 w-6 " />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              {data?.user?.role === "OWNER" && (
                <li>
                  <Link href="/dashboard" passHref>
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button onClick={() => signOut({ callbackUrl: "/sign-in" })}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      {status === "unauthenticated" && (
        <Link href="/sign-in">
          <label className="btn btn-square mx-4 w-24">Sign In</label>
        </Link>
      )}
    </div>
  );
}
