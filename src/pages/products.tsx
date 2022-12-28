import Image from "next/image";
import Link from "next/link";
import React from "react";
import { currency } from "../utils/formats";
import type { Product } from "@prisma/client";
import { useBasket } from "../providers/basket";
import { debounce } from "../utils/page";
import { trpc } from "../common/trpc";

type Props = {
  products?: Product[];
};

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (winScroll / height) * 100;
    setScrollPosition(scrolled);
  };

  React.useEffect(() => {
    window.addEventListener("scroll", debounce(handleScroll, 500), {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", debounce(handleScroll, 500));
    };
  }, []);

  return scrollPosition;
};

export default function Products({}: Props) {
  const { addItem } = useBasket();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.product.listProducts.useInfiniteQuery(
      {
        limit: 9,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const scrollPosition = useScrollPosition();

  React.useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching, scrollPosition]);

  return (
    <div className="min-h-screen">
      <div className="w-full pt-12">
        <p className="text-center text-4xl normal-case underline decoration-secondary">
          Products
        </p>
      </div>
      <div className="bg-base-100">
        <div className="sm:py-22 mx-auto max-w-2xl py-16 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {products &&
              products.length > 0 &&
              products.map((product) => (
                <div key={product.id} className="w-full">
                  <Link href={`product/${product.id}`} className="group">
                    <div className="aspect-w-1 aspect-h-1 sm:aspect-w-2 sm:aspect-h-3 w-full overflow-hidden rounded-lg">
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
                          height={475}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                        />
                      )}
                    </div>
                    <div className="mt-4 flex w-full items-center justify-between text-base font-medium text-gray-300">
                      <h3 className="w-7/12 truncate">{product.name}</h3>
                      <p className=" self-end truncate">
                        {currency(product.price)}
                      </p>
                    </div>
                    <p className="mt-1 w-8/12 truncate text-sm italic text-gray-400">
                      {product.description}
                    </p>
                  </Link>
                  <div className="mx-auto flex w-full justify-center self-end pt-4">
                    <button
                      onClick={() => addItem && addItem(product)}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-secondary py-3 px-8 text-base font-medium text-gray-800 transition-all hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-gray-50"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            {isFetching && (
              <div className="w-full items-center justify-center">
                <progress className="progress w-56"></progress>
              </div>
            )}
          </div>
          {!hasNextPage && (
            <div className="flex w-full justify-center pt-10">
              <p className="text-center text-lg font-bold">
                No More Products To Load
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
