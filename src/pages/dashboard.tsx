import type { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { requireAuth } from "../common/requireAuth";
import { trpc } from "../common/trpc";
import { prisma } from "../common/prisma";
import type {
  Order as Ord,
  OrderProduct,
  Payment,
  Product,
  User,
} from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { format, parseISO } from "date-fns";
import { currency } from "../utils/formats";

type Order = Ord & {
  product: OrderProduct[];
  payment: Payment | null;
  user: User | null;
};

type Props = {
  products: Product[];
  orders: Order[];
  customers: (User & {
    orders: Order[];
    payments: Payment[];
  })[];
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
  customers: (User & {
    orders: Order[];
    payments: Payment[];
  })[];
  products: Product[];
  orders: Order[];
  searchValue: string;
  rightSection: RightSection;
  selectedCustomer?: User;
  selectedProduct?: Product;
  selectedOrder?: Order;
  selectedPayment?: Payment[];
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

  const totalPayments = 91200;
  const newUsers = 4200;
  const ordersCount = 31000;
  const newUsersPercentage = 22;
  const newUsersDifference = 400;
  const totalPaymentsDifference = 900;
  const totalPaymentsPercentage = Math.round(
    (totalPaymentsDifference / totalPayments) * 100
  );

  return (
    <div className="min-h-screen w-screen flex-1 justify-center">
      <div className="flex w-full items-center justify-center  pt-12">
        <div className="stats stats-vertical border border-gray-700 shadow lg:stats-horizontal">
          <div className="stat">
            <div className="stat-title">Orders</div>
            <div className="stat-value">{ordersCount / 1000}K</div>
            <div className="stat-desc">Jan 1st - Feb 1st</div>
          </div>

          <div className="stat">
            <div className="stat-title">New Users</div>
            <div className="stat-value">{newUsers}</div>
            <div className="stat-desc">
              ↗︎ {newUsersDifference} ({newUsersPercentage}%)
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Total Payments</div>
            <div className="stat-value">{currency(totalPayments)}</div>
            <div className="stat-desc">
              ↘︎ {currency(totalPaymentsDifference)} ({totalPaymentsPercentage}
              %)
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-between space-y-4 px-12 py-8 lg:flex-row lg:space-y-0">
        <div className="flex h-12 w-fit items-center rounded-lg border border-gray-700 bg-base-200 lg:self-start">
          <div className="tabs tabs-boxed">
            {tabs &&
              tabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => setState((s) => ({ ...s, currentTab: tab }))}
                  className={`
                    ${
                      state.currentTab === tab
                        ? "btn-secondary rounded-lg"
                        : "text-white "
                    } 
                    tab
                  `}
                >
                  {tab}
                </div>
              ))}
          </div>
        </div>
        <div className="w-fit rounded-lg border border-gray-700 lg:self-end">
          <div className="form-control ">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search…"
                className="input-bordered input h-12"
              />
              <button className="btn btn-square">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className=" h-full w-full overflow-x-auto p-12">
        {state.currentTab === Tabs.Orders && (
          <div>
            <div className="flex w-full self-end px-6">
              {state.selectedOrders && state.selectedOrders.length > 0 && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to remove these Order(s) ?"
                      ) == true
                    ) {
                      deleteUsers(state.selectedCustomers);
                    }
                  }}
                  className="btn-outline btn btn-square"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="rounded-lg border border-gray-700">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th
                      onClick={() => {
                        if (
                          state.selectedOrders &&
                          state.selectedOrders.length === orders.length
                        ) {
                          setState({
                            ...state,
                            selectedOrders: [],
                          });
                        } else {
                          setState({
                            ...state,
                            selectedOrders: ordersData.map((order) => order.id),
                          });
                        }
                      }}
                    >
                      <label>
                        <input type="checkbox" className="checkbox h-5 w-5" />
                      </label>
                    </th>
                    <th className="overflow-hidden">Email</th>
                    <th className="overflow-hidden truncate">
                      Total & Quantity
                    </th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData &&
                    ordersData.map((order) => (
                      <tr className="text-sm" key={order.id}>
                        <th>
                          <label>
                            <input
                              checked={
                                state.selectedOrders &&
                                state.selectedOrders.length > 0 &&
                                state.selectedOrders.includes(order.id)
                              }
                              onClick={() => {
                                setState({
                                  ...state,
                                  selectedOrders: state.selectedOrders
                                    ? [...state.selectedOrders, order.id]
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
                                {order.user?.email}
                              </div>
                              <div className="truncate text-xs opacity-50">
                                {order.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden h-full xl:table-cell">
                          {format(parseISO(order.createdAt.toString()), "PPpp")}
                        </td>
                        <td className="h-full xl:hidden">
                          {format(parseISO(order.createdAt.toString()), "PP")}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              setState((s) => ({
                                ...s,
                                selectedOrder: order,
                                rightSection: RightSection.Customer,
                              }))
                            }
                            className="btn btn-ghost btn-xs opacity-60 hover:opacity-100"
                          >
                            User
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th></th>
                    <th className="overflow-hidden">Email</th>
                    <th className="overflow-hidden truncate">
                      Total & Quantity
                    </th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {state.currentTab === Tabs.Products && (
          <div className="rounded-lg border border-gray-700">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Favorite Color</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src="/tailwind-css-component-profile-2@56w.png"
                            alt="Avatar Tailwind CSS Component"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">Hart Hagerty</div>
                        <div className="text-sm opacity-50">United States</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    Zemlak, Daniel and Leannon
                    <br />
                    <span className="badge-ghost badge badge-sm">
                      Desktop Support Technician
                    </span>
                  </td>
                  <td>Purple</td>
                  <th>
                    <button className="btn btn-ghost btn-xs">details</button>
                  </th>
                </tr>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src="/tailwind-css-component-profile-3@56w.png"
                            alt="Avatar Tailwind CSS Component"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">Brice Swyre</div>
                        <div className="text-sm opacity-50">China</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    Carroll Group
                    <br />
                    <span className="badge-ghost badge badge-sm">
                      Tax Accountant
                    </span>
                  </td>
                  <td>Red</td>
                  <th>
                    <button className="btn btn-ghost btn-xs">details</button>
                  </th>
                </tr>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src="/tailwind-css-component-profile-4@56w.png"
                            alt="Avatar Tailwind CSS Component"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">Marjy Ferencz</div>
                        <div className="text-sm opacity-50">Russia</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    Rowe-Schoen
                    <br />
                    <span className="badge-ghost badge badge-sm">
                      Office Assistant I
                    </span>
                  </td>
                  <td>Crimson</td>
                  <th>
                    <button className="btn btn-ghost btn-xs">details</button>
                  </th>
                </tr>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src="/tailwind-css-component-profile-5@56w.png"
                            alt="Avatar Tailwind CSS Component"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">Yancy Tear</div>
                        <div className="text-sm opacity-50">Brazil</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    Wyman-Ledner
                    <br />
                    <span className="badge-ghost badge badge-sm">
                      Community Outreach Specialist
                    </span>
                  </td>
                  <td>Indigo</td>
                  <th>
                    <button className="btn btn-ghost btn-xs">details</button>
                  </th>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Favorite Color</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {state.currentTab === Tabs.Customers && (
          <div>
            <div className="flex w-full self-end px-6">
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
                    className="btn-outline btn btn-square"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
            </div>
            <div className="rounded-lg border border-gray-700">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th
                      onClick={() => {
                        if (
                          state.selectedCustomers &&
                          state.selectedCustomers.length === customers.length
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
                        <input type="checkbox" className="checkbox h-5 w-5" />
                      </label>
                    </th>
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
                                state.selectedCustomers.includes(customer.id)
                              }
                              onClick={() => {
                                setState({
                                  ...state,
                                  selectedCustomers: state.selectedCustomers
                                    ? [...state.selectedCustomers, customer.id]
                                    : [customer.id],
                                });
                              }}
                              type="checkbox"
                              className="checkbox h-5 w-5"
                            />
                          </label>
                        </th>
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
                          <p className="cursor-pointer transition-all hover:opacity-50">
                            {customer.email}
                          </p>
                          <br />
                        </td>
                        <td className="hidden h-full xl:table-cell">
                          {format(
                            parseISO(customer.createdAt.toString()),
                            "PPpp"
                          )}
                        </td>
                        <td className="h-full xl:hidden">
                          {format(
                            parseISO(customer.createdAt.toString()),
                            "PP"
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              setState((s) => ({
                                ...s,
                                selectedOrder: customer.orders[0],
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
                <tfoot>
                  <tr>
                    <th></th>
                    <th>Email</th>
                    <th>Customer Since</th>
                    <th>Orders</th>
                    <th>Payments</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
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
      orders: true,
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
