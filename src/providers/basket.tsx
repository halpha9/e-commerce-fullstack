import { Product } from "@prisma/client";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { BASKET_KEY } from "../utils/keys";

interface State {
  loading: boolean;
  addItem?: (product: Product) => void;
  removeItem?: (product: Product) => void;
  products?: Product[] | any[];
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

export interface BasketContextValue extends State {}

const initialState: State = {
  loading: true,
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
    console.log(items);

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
  }, []);


  const removeItem = useCallback((product: Product) => {
    const items = retrieve();
    const newItems = items.filter((item: Product) => item.id !== product.id);
    persist(newItems);
    setState({ ...state, products: newItems });
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
