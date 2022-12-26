// @ts-nocheck
import type { GetServerSideProps, NextPage } from "next";
import { useSession, signOut } from "next-auth/react";

import { requireAuth } from "../../common/requireAuth";
import { trpc } from "../../common/trpc";
import { prisma } from "../../common/prisma";
import { Order, Payment, Product, User } from "@prisma/client";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  ArchiveBoxIcon,
  AtSymbolIcon,
  Bars3Icon,
  BellIcon,
  InformationCircleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { classNames } from "../../utils/classNames";
import { format, parseISO } from "date-fns";
import SearchBar from "../../components.tsx/searchBar";
import { currency } from "../../utils/formats";
import Header from "../../components.tsx/header";
type Props = {
  products: Product[];
  orders: Order[];
  customers: User[];
  staff: User[];
};

enum Tabs {
  Orders = "Orders",
  Products = "Products",
  Customers = "Customers",
}
enum RightSection {
  Order = "Order",
  Product = "Product",
  Customer = "Customer",
  Payment = "Payment",
  Empty = "Empty",
  Payments = "Payments",
  Orders = "Orders",
}

type State = {
  currentTab: Tabs;
  selectedCustomers: string[];
  selectedProducts: string[];
  selectedOrders: string[];
  customers: User[];
  products: Product[];
  orders: Order[];
  searchValue: string;
  rightSection: RightSection;
  selectedCustomer?: User;
  selectedProduct?: Product;
  selectedOrder?: Order;
  selectedPayment?: Payment;
};

const tabs = [Tabs.Orders, Tabs.Products, Tabs.Customers];
const Dashboard = ({ products, orders, staff, customers }: Props) => {
  const { mutateAsync: deleteUsers } = trpc.user.deleteUsers.useMutation();
  const { data: SessionData } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (SessionData) {
      if (SessionData.user.role !== "OWNER") {
        router.push("/products");
      }
    }
  }, [SessionData]);

  const [state, setState] = useState<State>({
    currentTab: Tabs.Orders,
    rightSection: RightSection.Empty,
    selectedCustomers: [],
    selectedProducts: [],
    selectedOrders: [],
    customers: [],
    orders: [],
    products: [],
    searchValue: "",
  });

  const customerData =
    state.customers && state.customers.length > 0 && state.customers
      ? state.customers
      : customers;

  const productData =
    state.products && state.products.length > 0 && state.products
      ? state.products
      : products;

  const ordersData =
    state.orders && state.orders.length > 0 && state.orders
      ? state.orders
      : orders;

  return (
    <div className="min-h-full bg-base-100 p-6 py-8">
      <div className="stats shadow border-gray-600 border rounded-lg bg-base-200 my-4 max-w-3xl lg:max-w-full self-end px-4 sm:px-6 flex lg:px-8 mx-7">
        <div className="stat">
          <div className="stat-figure text-secondary">
            <InformationCircleIcon className="inline-block w-8 h-8 stroke-current" />
          </div>
          <div className="stat-title">Downloads</div>
          <div className="stat-value">31K</div>
          <div className="stat-desc">Jan 1st - Feb 1st</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <AdjustmentsHorizontalIcon className="inline-block w-8 h-8 stroke-current" />
          </div>
          <div className="stat-title">New Users</div>
          <div className="stat-value">4,200</div>
          <div className="stat-desc">↗︎ 400 (22%)</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <ArchiveBoxIcon className="inline-block w-8 h-8 stroke-current" />
          </div>
          <div className="stat-title">New Registers</div>
          <div className="stat-value">1,200</div>
          <div className="stat-desc">↘︎ 90 (14%)</div>
        </div>
      </div>
      <main className="pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-full lg:px-8">
          <h1 className="sr-only">Page title</h1>
          {/* Main 3 column grid */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
            {/* Left column */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-2 border-gray-600 shadow border rounded-lg bg-base-200">
              <div className="flex justify-between m-4 p-4 rounded-lg bg-base-200">
                <div className="tabs tabs-boxed px-2 border-gray-600 border flex justify-center items-center">
                  {tabs &&
                    tabs.map((tab) => (
                      <div
                        key={tab}
                        onClick={() => setState({ currentTab: tab })}
                        className={classNames(
                          !!(state.currentTab === tab) &&
                            "tab-active bg-purple-400",
                          "tab"
                        )}
                      >
                        {tab}
                      </div>
                    ))}
                </div>
                {state.currentTab === Tabs.Customers && (
                  <SearchBar
                    originalData={customers}
                    setResult={(e) => {
                      setState((s) => ({ ...s, customers: e! }));
                    }}
                    searchKeysArray={[
                      "name",
                      "description",
                      "price",
                      "quantity",
                      "category",
                    ]}
                  />
                )}
                {state.currentTab === Tabs.Orders && (
                  <SearchBar
                    originalData={orders}
                    setResult={(e) => {
                      setState((s) => ({ ...s, orders: e! }));
                    }}
                    searchKeysArray={[
                      "address",
                      "status",
                      "user.username",
                      "user.email",
                      "product.name",
                      "product.description",
                    ]}
                  />
                )}
                {state.currentTab === Tabs.Products && (
                  <SearchBar
                    originalData={products}
                    setResult={(e) => {
                      setState((s) => ({ ...s, products: e! }));
                    }}
                    searchKeysArray={["username", "email"]}
                  />
                )}
              </div>
              <section aria-labelledby="section-1-title">
                <h2 className="sr-only" id="section-1-title">
                  Section title
                </h2>
                {state.currentTab === Tabs.Orders && (
                  <div className="overflow-hidden rounded-lg bg-base-200 shadow">
                    <div className="w-full self-end flex px-6">
                      {state.selectedOrders &&
                        state.selectedOrders.length > 0 && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to remove these orders(s) ?"
                                ) == true
                              ) {
                                deleteUsers(state.selectedOrders);
                              }
                            }}
                            className="btn btn-square btn-outline"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                    </div>
                    <div className="p-6 h-screen">
                      <div className="overflow-x-auto w-full">
                        <table className="table w-full table-fixed">
                          <thead>
                            <tr>
                              <th
                                onClick={() => {
                                  if (
                                    state.selectedOrders &&
                                    state.selectedOrders.length ===
                                      orders.length
                                  ) {
                                    setState({
                                      ...state,
                                      selectedOrders: [],
                                    });
                                  } else {
                                    setState({
                                      ...state,
                                      selectedOrders: ordersData.map(
                                        (order) => order.id
                                      ),
                                    });
                                  }
                                }}
                              >
                                <label>
                                  <input
                                    type="checkbox"
                                    className="checkbox h-5 w-5"
                                  />
                                </label>
                              </th>
                              <th className="overflow-hidden">Name</th>
                              <th className="overflow-hidden truncate">
                                Total & Quantity
                              </th>
                              <th>Date</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersData &&
                              ordersData.length > 0 &&
                              ordersData.map((order) => {
                                return (
                                  <tr className="text-sm" key={order.id}>
                                    <th>
                                      <label>
                                        <input
                                          checked={
                                            state.selectedOrders &&
                                            state.selectedOrders.length > 0 &&
                                            state.selectedOrders.includes(
                                              order.id
                                            )
                                          }
                                          onClick={() => {
                                            setState({
                                              ...state,
                                              selectedOrders:
                                                state.selectedOrders
                                                  ? [
                                                      ...state.selectedOrders,
                                                      order.id,
                                                    ]
                                                  : [order.id],
                                            });
                                          }}
                                          type="checkbox"
                                          className="checkbox h-5 w-5"
                                        />
                                      </label>
                                    </th>
                                    <td className="overflow-hidden">
                                      <div className="flex items-center space-x-3">
                                        <div>
                                          <div className="font-bold">
                                            {order.user.username}
                                          </div>
                                          <div className="text-xs opacity-50 truncate">
                                            {order.address}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      Total: {currency(order.payment.amount)}
                                      <br />
                                      <span className="badge badge-ghost badge-sm -ml-2">
                                        Quantity: {order.quantity}
                                      </span>
                                    </td>
                                    <td className="hidden">
                                      {format(
                                        parseISO(order.createdAt),
                                        "PPpp"
                                      )}
                                    </td>
                                    <td className=" xl:hidden">
                                      {format(parseISO(order.createdAt), "PP")}
                                    </td>
                                    <th>
                                      <button
                                        onClick={() =>
                                          setState((s) => ({
                                            ...s,
                                            selectedOrder: order,
                                            rightSection: RightSection.Order,
                                          }))
                                        }
                                        className="btn btn-ghost btn-xs"
                                      >
                                        Products
                                      </button>
                                    </th>
                                    <th>
                                      <button
                                        onClick={() =>
                                          setState((s) => ({
                                            ...s,
                                            selectedCustomer: order.user,
                                            rightSection: RightSection.Customer,
                                          }))
                                        }
                                        className="btn btn-ghost btn-xs"
                                      >
                                        User
                                      </button>
                                    </th>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {state.currentTab === Tabs.Products && (
                  <div className="overflow-hidden rounded-lg bg-base-200 shadow">
                    <div className="w-full self-end flex px-6">
                      {state.selectedProducts &&
                        state.selectedProducts.length > 0 && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to remove these products(s) ?"
                                ) == true
                              ) {
                                deleteUsers(state.selectedProducts);
                              }
                            }}
                            className="btn btn-square btn-outline"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                    </div>
                    <div className="p-6 h-screen">
                      <div className="overflow-x-auto w-full">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th
                                onClick={() => {
                                  if (
                                    state.selectedProducts &&
                                    state.selectedProducts.length ===
                                      products.length
                                  ) {
                                    setState({
                                      ...state,
                                      selectedProducts: [],
                                    });
                                  } else {
                                    setState({
                                      ...state,
                                      selectedProducts: productData.map(
                                        (product) => product.id
                                      ),
                                    });
                                  }
                                }}
                              >
                                <label>
                                  <input
                                    type="checkbox"
                                    className="checkbox h-5 w-5"
                                  />
                                </label>
                              </th>
                              <th>Name</th>
                              <th>Price & Quantity</th>
                              <th>Category</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {productData &&
                              productData.length > 0 &&
                              productData.map((product) => {
                                return (
                                  <tr className="text-sm" key={product.id}>
                                    <th>
                                      <label>
                                        <input
                                          checked={
                                            state.selectedProducts &&
                                            state.selectedProducts.length > 0 &&
                                            state.selectedProducts.includes(
                                              product.id
                                            )
                                          }
                                          onClick={() => {
                                            setState({
                                              ...state,
                                              selectedProducts:
                                                state.selectedProducts
                                                  ? [
                                                      ...state.selectedProducts,
                                                      product.id,
                                                    ]
                                                  : [product.id],
                                            });
                                          }}
                                          type="checkbox"
                                          className="checkbox h-5 w-5"
                                        />
                                      </label>
                                    </th>
                                    <td>
                                      <div className="flex items-center space-x-3">
                                        <div className="avatar">
                                          <div className="mask mask-squircle w-12 h-12">
                                            <img
                                              src={product.image}
                                              alt="Avatar Tailwind CSS Component"
                                            />
                                          </div>
                                        </div>
                                        <div
                                          onClick={() =>
                                            setState((s) => ({
                                              ...s,
                                              selectedProduct: product,
                                              rightSection:
                                                RightSection.Product,
                                            }))
                                          }
                                          className="font-bold cursor hover:opacity-50 transition-all"
                                        >
                                          {product.name}
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      Price: {currency(product.price)}
                                      <br />
                                      <span className="badge badge-ghost badge-sm -ml-2">
                                        Quantity: {product.quantity}
                                      </span>
                                    </td>
                                    <td>{product.category}</td>
                                    <th>
                                      <button
                                        onClick={() =>
                                          setState((s) => ({
                                            ...s,
                                            selectedOrder: product.order,
                                            rightSection: RightSection.Order,
                                          }))
                                        }
                                        className="btn btn-ghost btn-xs"
                                      >
                                        Orders
                                      </button>
                                    </th>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {state.currentTab === Tabs.Customers && (
                  <div className="overflow-hidden overflow-y-scroll rounded-lg bg-base-200 shadow">
                    <div className="w-full self-end flex px-6">
                      {state.selectedCustomers &&
                        state.selectedCustomers.length > 0 && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to remove these user(s) ?"
                                ) == true
                              ) {
                                deleteUsers(state.selectedCustomers);
                              }
                            }}
                            className="btn btn-square btn-outline"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                    </div>
                    <div className="p-6 h-screen">
                      <div className="overflow-x-auto w-full">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th
                                onClick={() => {
                                  if (
                                    state.selectedCustomers &&
                                    state.selectedCustomers.length ===
                                      customers.length
                                  ) {
                                    setState({
                                      ...state,
                                      selectedCustomers: [],
                                    });
                                  } else {
                                    setState({
                                      ...state,
                                      selectedCustomers: customerData.map(
                                        (customer) => customer.id
                                      ),
                                    });
                                  }
                                }}
                              >
                                <label>
                                  <input
                                    type="checkbox"
                                    className="checkbox h-5 w-5"
                                  />
                                </label>
                              </th>
                              <th className="hidden xl:flex px-3">Username</th>
                              <th>Email</th>
                              <th>Customer Since</th>
                              <th>Orders</th>
                              <th>Payments</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerData &&
                              customerData.map((customer) => (
                                <tr className="text-sm" key={customer.id}>
                                  <th>
                                    <label>
                                      <input
                                        checked={
                                          state.selectedCustomers &&
                                          state.selectedCustomers.length > 0 &&
                                          state.selectedCustomers.includes(
                                            customer.id
                                          )
                                        }
                                        onClick={() => {
                                          setState({
                                            ...state,
                                            selectedCustomers:
                                              state.selectedCustomers
                                                ? [
                                                    ...state.selectedCustomers,
                                                    customer.id,
                                                  ]
                                                : [customer.id],
                                          });
                                        }}
                                        type="checkbox"
                                        className="checkbox h-5 w-5"
                                      />
                                    </label>
                                  </th>
                                  <td className="hidden xl:flex">
                                    <div className="flex items-center space-x-3">
                                      <div>
                                        <div className="font-bold">
                                          {customer.username}
                                        </div>
                                        <div className="text-sm opacity-50">
                                          {customer.role}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    onClick={() =>
                                      setState((s) => ({
                                        ...s,
                                        selectedCustomer: customer,
                                        rightSection: RightSection.Customer,
                                      }))
                                    }
                                    className="items-center justify-center overflow-hidden"
                                  >
                                    <p className="cursor-pointer hover:opacity-50 transition-all">
                                      {customer.email}
                                    </p>
                                    <br />
                                  </td>
                                  <td className="hidden xl:table-cell h-full">
                                    {format(
                                      parseISO(customer.createdAt),
                                      "PPpp"
                                    )}
                                  </td>
                                  <td className="xl:hidden h-full">
                                    {format(parseISO(customer.createdAt), "PP")}
                                  </td>
                                  <td>
                                    <button
                                      onClick={() =>
                                        setState((s) => ({
                                          ...s,
                                          selectedOrder: customer.orders,
                                          rightSection: RightSection.Orders,
                                        }))
                                      }
                                      className="btn btn-ghost btn-xs opacity-60 hover:opacity-100"
                                    >
                                      Orders
                                    </button>
                                  </td>
                                  <td>
                                    <button
                                      onClick={() =>
                                        setState((s) => ({
                                          ...s,
                                          selectedPayment: customer.payments,
                                          rightSection: RightSection.Payments,
                                        }))
                                      }
                                      className="btn btn-ghost btn-xs opacity-60 hover:opacity-100"
                                    >
                                      Payments
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right column */}
            <div className="grid grid-cols-1 gap-4">
              {state.rightSection === RightSection.Customer &&
                state.selectedCustomer && (
                  <section aria-labelledby="section-2-title">
                    <h2 className="sr-only" id="section-2-title">
                      Section title
                    </h2>
                    <div className="overflow-hidden bg-base-200 border-gray-600 shadow border rounded-lg">
                      <div className="p-6 h-screen">
                        {" "}
                        <div>
                          <div>
                            <div className="inline-block">
                              <span
                                className={classNames(
                                  "bg-indigo-100 text-indigo-800",
                                  "inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium"
                                )}
                              >
                                User
                              </span>
                            </div>
                          </div>
                          <div className="mt-6 flex items-center">
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                <img
                                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                  alt=""
                                />
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium flex-nowrap opacity-90">
                                <div>{state.selectedCustomer.username}</div>
                              </p>
                              <div className="flex space-x-1 text-sm text-gray-500">
                                <p className="text-sm font-medium flex-nowrap opacity-90">
                                  Joined
                                </p>
                                <span aria-hidden="true">&middot;</span>
                                <div>
                                  {format(
                                    parseISO(state.selectedCustomer.createdAt),
                                    "PPp"
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 block">
                            <div className="flex-nowrap opacity-60 flex items-center space-x-1">
                              <AtSymbolIcon
                                className="h-4 w-4"
                                strokeWidth={2}
                              />
                              <span>{state.selectedCustomer.email}</span>
                            </div>
                            <p className="mt-3 text-base opacity-90">
                              <span className="font-semibold opacity-50">
                                Orders:
                              </span>{" "}
                              {state?.selectedCustomer?.orders?.length || 0}
                            </p>

                            <p className="mt-3 text-base opacity-90">
                              <span className="font-semibold opacity-50">
                                Account Value:
                              </span>{" "}
                              {currency(
                                state?.selectedCustomer?.payments?.length || 0
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              {state.rightSection === RightSection.Empty && (
                <section aria-labelledby="section-2-title">
                  <h2 className="sr-only" id="section-2-title">
                    Section title
                  </h2>
                  <div className="overflow-hidden bg-base-200 border-gray-600 shadow border rounded-lg">
                    <div className="p-6 h-screen">
                      {" "}
                      <div>
                        <div>
                          <div className="inline-block">
                            <span
                              className={classNames(
                                "bg-indigo-100 text-indigo-800",
                                "inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium"
                              )}
                            >
                              User
                            </span>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt=""
                              />
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium flex-nowrap opacity-90">
                              <div>Paul York</div>
                            </p>
                            <div className="flex space-x-1 text-sm text-gray-500">
                              <time dateTime="2020-03-16">Mar 16, 2020</time>
                              <span aria-hidden="true">&middot;</span>
                              <span>6 min read</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 block">
                          <p className="flex-nowrap opacity-60">
                            Boost your conversion rate
                          </p>
                          <p className="mt-3 text-base opacity-90">
                            Nullam risus blandit ac aliquam justo ipsum. Quam
                            mauris volutpat massa dictumst amet. Sapien tortor
                            lacus arcu.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>{" "}
    </div>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = requireAuth(async () => {
  const products = await prisma.product.findMany({});
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      product: true,
      payment: true,
    },
  });
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      payments: true,
    },
  });
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
