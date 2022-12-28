import type { Product } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";
import React, { createContext, useContext, useState, useCallback } from "react";
import { BASKET_KEY } from "../utils/keys";

interface BasketItem extends Product {
  quantity: number;
}
interface State {
  loading: boolean;
  addItem?: (product: Product) => void;
  removeItem?: (product: Product) => void;
  clearBasket?: () => void;
  products?: BasketItem[];
  subtotal?: number;
  taxes?: number;
  shipping?: number;
  total: number | null;
  quantity?: number;
  discount?: { code: string; amount: number };
}

const persist = (data: Product[]) => {
  localStorage.setItem(BASKET_KEY, JSON.stringify(data));
};

const retrieve = () => {
  const items = localStorage.getItem(BASKET_KEY);
  if (items) {
    return JSON.parse(items);
  }
  return { products: [] };
};

export type BasketContextValue = State;

const initialState: State = {
  loading: true,
  total: null,
};

const BasketContext = createContext({
  setState: {} as Dispatch<SetStateAction<State>>,
  ...(initialState as BasketContextValue),
});

type BasketProps = {
  children: React.ReactNode;
  value?: Partial<State>;
};

function BP({ children }: BasketProps) {
  const [state, setState] = useState<State>(initialState);

  React.useEffect(() => {
    const items = retrieve();
    getBasketValues();
    getQuantity();
    setState((s) => ({ ...s, products: items }));
  }, []);

  const addItem = useCallback(
    (product: Product) => {
      const items = retrieve();
      let newItems: Product[];
      if (items.length > 0) {
        const itemExists = items.findIndex(
          (item: Product) => item.id === product.id
        );
        const itemInQuestion: BasketItem = items.find(
          (item: Product) => item.id === product.id
        );

        const itemsList: BasketItem[] =
          itemExists > -1
            ? items.filter((item: Product) => item.id !== product.id)
            : [...items, { ...product, quantity: 1 }];

        newItems =
          itemExists > -1
            ? [
                ...itemsList,
                { ...product, quantity: itemInQuestion.quantity + 1 },
              ]
            : itemsList;
      } else {
        newItems = [{ ...product, quantity: 1 }];
      }
      setState((s) => ({ ...s, products: newItems }));
      persist(newItems);
      getQuantity();
      getBasketValues();
    },
    [state]
  );

  const removeItem = useCallback((product: Product) => {
    const items = retrieve();
    const newItems = items.filter((item: Product) => item.id !== product.id);
    persist(newItems);
    setState((s) => ({ ...s, products: newItems }));
    getBasketValues();
    getQuantity();
  }, []);

  const getBasketValues = useCallback(() => {
    const basketItems: BasketItem[] = retrieve();
    let total: number = 0;
    let shipping: number = 0;
    let subtotal: number = 0;
    let taxes: number = 0;
    let res = {
      total: 0,
      shipping: 0,
      subtotal: 0,
      taxes: 0,
    };
    if (basketItems && basketItems.length > 0) {
      subtotal =
        (basketItems &&
          basketItems.length > 0 &&
          basketItems
            .map((item: BasketItem) => {
              return item.price * item.quantity;
            })
            .reduce((a, b) => a + b, 0)) ||
        0;
      taxes = subtotal * 0.175;
      shipping = 50;

      total = Math.round(taxes + shipping + subtotal);
    }
    res = {
      subtotal,
      taxes,
      shipping,
      total,
    };
    setState((s) => ({
      ...s,
      ...res,
    }));
  }, []);

  const getQuantity = useCallback(() => {
    const basketItems: BasketItem[] = retrieve();
    let total = 0;
    if (basketItems && basketItems.length > 0) {
      total = basketItems.reduce((acc, item) => acc + item.quantity, 0);
    }
    setState((s) => ({ ...s, quantity: total }));
  }, []);

  const clearBasket = () => {
    localStorage.removeItem(BASKET_KEY);
    setState((s) => ({ ...s, products: [] }));
  };

  const value = {
    ...state,
    setState,
    addItem,
    removeItem,
    clearBasket,
  };

  return (
    <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
  );
}

export const BasketProvider = BP;

export const useBasket = () => useContext(BasketContext);

export default BasketProvider;
