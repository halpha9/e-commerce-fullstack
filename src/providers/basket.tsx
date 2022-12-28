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
  products?: BasketItem[];
  subtotal?: number;
  taxes?: number;
  shipping?: number;
  total: number;
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
  total: 100,
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
    setState({ ...state, products: items });
  }, []);

  const addItem = useCallback((product: Product) => {
    const items = retrieve();
    let newItems;

    if (items) {
      const itemExists = items.findIndex(
        (item: Product) => item.id === product.id
      );
      const itemInQuestion = items.find(
        (item: Product) => item.id === product.id
      );
      const itemsList =
        itemExists > -1
          ? items.splice(itemExists, 1)
          : [...items, { ...product, quantity: 1 }];
      newItems =
        itemExists > -1
          ? [...itemsList, { ...product, quantity: itemInQuestion.quanity++ }]
          : itemsList;
    } else {
      newItems = [{ ...product, quantity: 1 }];
    }
    persist(newItems);
    setState({ ...state, products: newItems });
    getQuantity();
    getBasketValues();
  }, []);

  const removeItem = useCallback((product: Product) => {
    const items = retrieve();
    const newItems = items.filter((item: Product) => item.id !== product.id);
    persist(newItems);
    setState({ ...state, products: newItems });
    getBasketValues();
    getQuantity();
  }, []);

  const getBasketValues = useCallback(() => {
    const basketItems: BasketItem[] = retrieve();
    let total: number = 0;
    let res = {};
    if (basketItems && basketItems.length > 0) {
      const subtotal =
        (basketItems &&
          basketItems.length > 0 &&
          basketItems
            .map((item: BasketItem) => {
              return item.price;
            })
            .reduce((a, b) => a + b, 0)) ||
        0;
      const taxes = subtotal * 0.175;
      const shipping = 50;

      total = taxes + shipping + subtotal;
      res = {
        subtotal,
        taxes,
        shipping,
        total,
      };
    }
    setState((s) => ({ ...s, quantity: total, ...res }));
  }, []);

  const getQuantity = useCallback(() => {
    const basketItems: BasketItem[] = retrieve();
    let total = 0;
    if (basketItems && basketItems.length > 0) {
      total = basketItems.reduce((acc, item) => acc + item.quantity, 0);
    }
    setState((s) => ({ ...s, quantity: total }));
  }, []);

  React.useEffect(() => {
    getBasketValues();
    getQuantity();
  }, []);

  const value = {
    ...state,
    setState,
    addItem,
    removeItem,
  };

  return (
    <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
  );
}

export const BasketProvider = BP;

export const useBasket = () => useContext(BasketContext);

export default BasketProvider;
