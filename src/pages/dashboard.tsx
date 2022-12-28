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
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { format, parseISO } from "date-fns";
import { currency } from "../utils/formats";
import SearchBar from "../components/SearchBar";

type Order = Ord & {
  product: OrderProduct[];
  payment: Payment | null;
  user: User | null;
};

type Props = {
  payments: Payment[];
  products: (Product & {
    order: OrderProduct[];
  })[];
  orders: (Ord & {
    product: (OrderProduct & {
      product: Product;
    })[];
    payment: Payment | null;
    user: User | null;
  })[];
  customers: (User & {
    orders: Order[];
    payments: Payment[];
  })[];
  staff: (User & {
    orders: Ord[];
    payments: Payment[];
  })[];
  totalPayments: number;
  totalOrders: number;
  totalUsers: number;
};

enum Tabs {
  Orders = "Orders",
  Products = "Products",
  Customers = "Customers",
  Payments = "Payments",
  Staff = "Staff",
}

type State = {
  payments: Payment[];
  currentTab: Tabs;
  selectedCustomers: string[];
  selectedProducts: string[];
  selectedOrders: string[];
  customers: (User & {
    orders: Order[];
    payments: Payment[];
  })[];
  products: (Product & {
    order: OrderProduct[];
  })[];
  orders: Order[];
  searchValue: string;
  selectedCustomer?: User;
  selectedProduct?: Product;
  selectedOrder?: Order;
  selectedPayment?: Payment[];
  staff: (User & {
    orders: Ord[];
    payments: Payment[];
  })[];
};

const tabs = [
  Tabs.Orders,
  Tabs.Products,
  Tabs.Customers,
  Tabs.Payments,
  Tabs.Staff,
];
const Dashboard = ({
  products,
  orders,
  staff,
  customers,
  payments,
  totalOrders,
  totalPayments,
  totalUsers,
}: Props) => {
  const { mutateAsync: deleteUsers } = trpc.user.deleteUsers.useMutation();
  const { data: SessionData } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (SessionData) {
      if (SessionData.user.role !== "OWNER") {
        router.push("/");
      }
    }
  }, [SessionData]);

  const [state, setState] = useState<State>({
    currentTab: Tabs.Orders,
    selectedCustomers: [],
    selectedProducts: [],
    selectedOrders: [],
    customers: [],
    orders: [],
    products: [],
    searchValue: "",
    staff: [],
    payments: [],
  });

  const customerData =
    state.customers && state.customers.length > 0
      ? state.customers
      : state.searchValue.length > 0 &&
        state.customers &&
        state.customers.length === 0
      ? []
      : customers;

  const staffData =
    state.staff && state.staff.length > 0
      ? state.staff
      : state.searchValue.length > 0 && state.staff && state.staff.length === 0
      ? []
      : staff;

  const productData =
    state.products && state.products.length > 0
      ? state.products
      : state.searchValue.length > 0 &&
        state.products &&
        state.products.length === 0
      ? []
      : products;

  const ordersData =
    state.orders && state.orders.length > 0
      ? state.orders
      : state.searchValue.length > 0 &&
        state.orders &&
        state.orders.length === 0
      ? []
      : orders;

  const paymentsData =
    state.payments && state.payments.length > 0
      ? state.payments
      : state.searchValue.length > 0 &&
        state.payments &&
        state.payments.length === 0
      ? []
      : payments;

  const setResult = (data: any) => {
    console.log(data);
    if (state.currentTab === Tabs.Orders) {
      setState((s) => ({ ...s, orders: data }));
    } else if (state.currentTab === Tabs.Products) {
      setState((s) => ({ ...s, products: data }));
    } else if (state.currentTab === Tabs.Customers) {
      setState((s) => ({ ...s, customers: data }));
    } else if (state.currentTab === Tabs.Payments) {
      setState((s) => ({ ...s, payments: data }));
    } else if (state.currentTab === Tabs.Staff) {
      setState((s) => ({ ...s, staff: data }));
    }
  };

  const originalData =
    state.currentTab === Tabs.Orders
      ? orders
      : state.currentTab === Tabs.Products
      ? products
      : state.currentTab === Tabs.Customers
      ? customers
      : state.currentTab === Tabs.Payments
      ? payments
      : state.currentTab === Tabs.Staff
      ? staff
      : [];

  return (
    <div className="min-h-screen w-screen flex-1 justify-center">
      <div className="flex w-full items-center justify-center  pt-12">
        <div className="stats stats-vertical border border-gray-700 shadow lg:stats-horizontal">
          <div className="stat">
            <div className="stat-title">Orders</div>
            <div className="stat-value">{totalOrders}</div>
          </div>

          <div className="stat">
            <div className="stat-title">New Users</div>
            <div className="stat-value">{totalUsers}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Total Payments</div>
            <div className="stat-value">{currency(totalPayments)}</div>
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
          <SearchBar
            originalData={originalData}
            setSearchValue={(e) => {
              setState((s) => ({ ...s, searchValue: e }));
            }}
            setResult={(e) => {
              setResult(e);
            }}
            searchValue={state.searchValue}
            searchKeysArray={[
              "id",
              "email",
              "user.email",
              "description",
              "price",
              "quantity",
              "amount",
              "status",
              "currency",
              "category",
              "stripeId",
              "orderId",
              "total",
              "quantity",
              "date",
              "name",
            ]}
          />
        </div>
      </div>
      <div className=" h-full w-full overflow-x-auto p-12">
        {state.currentTab === Tabs.Orders && (
          <div>
            <div className="flex w-full self-end px-6"></div>
            <div className="rounded-lg border border-gray-700">
              <table className="table w-full overflow-hidden">
                <thead>
                  <tr>
                    <th></th>
                    <th>Order ID:</th>
                    <th className="overflow-hidden">Email</th>
                    <th className="overflow-hidden truncate">
                      Total & Quantity
                    </th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData && ordersData.length > 0 ? (
                    ordersData.map((order) => (
                      <tr className="text-sm" key={order.id}>
                        <th></th>
                        <td>{order.id}</td>
                        <td className="overflow-hidden">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-bold">
                                {order.user?.email || "Guest Checkout"}
                              </div>
                              <div className="truncate text-xs opacity-50">
                                {order.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          Total: {currency(order?.payment?.amount || 0)}
                          <br />
                          <span className="badge-ghost badge badge-sm -ml-2">
                            Quantity:{" "}
                            {order.product
                              .map((p) => p.quantity)
                              .reduce((a, b) => a + b, 0)}
                          </span>
                        </td>
                        <td>
                          <Badge text={order.status} />
                        </td>
                        <td className="hidden h-full xl:table-cell">
                          {format(parseISO(order.createdAt.toString()), "PPpp")}
                        </td>
                        <td className="h-full xl:hidden">
                          {format(parseISO(order.createdAt.toString()), "PP")}
                        </td>
                      </tr>
                    ))
                  ) : orders.length > 0 ? (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No Search Results Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Edit Your Search Query and Try Again.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No {Tabs.Orders}
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Add Some {Tabs.Orders} to See Them Here.
                        </p>
                      </div>
                    </div>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th></th>
                    <th>Order ID:</th>
                    <th className="overflow-hidden">Email</th>
                    <th className="overflow-hidden truncate">
                      Total & Quantity
                    </th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {state.currentTab === Tabs.Products && (
          <div className="rounded-lg border border-gray-700">
            <table className="table w-full overflow-hidden">
              <thead>
                <tr>
                  <th></th>
                  <th>Product ID:</th>
                  <th>Name</th>
                  <th>Price & Quantity</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {productData && productData.length > 0 ? (
                  productData.map((product) => {
                    return (
                      <tr className="text-sm" key={product.id}>
                        <th></th>
                        <td>{product.id}</td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar">
                              <div className="mask mask-squircle h-12 w-12">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt="Avatar Tailwind CSS Component"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="cursor font-bold transition-all hover:opacity-50">
                              {product.name}
                            </div>
                          </div>
                        </td>
                        <td>
                          Price: {currency(product.price)}
                          <br />
                          <span className="badge-ghost badge badge-sm -ml-2">
                            Quantity: {product.quantity}
                          </span>
                        </td>
                        <td>{product.category}</td>
                      </tr>
                    );
                  })
                ) : products.length > 0 ? (
                  <div className="mx-auto my-20 flex w-screen justify-center">
                    <div className="text-center">
                      <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-400">
                        No Search Results Found
                      </h3>
                      <p className="mt-1 text-sm text-gray-300">
                        Please Edit Your Search Query and Try Again.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto my-20 flex w-screen justify-center">
                    <div className="text-center">
                      <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-400">
                        No {Tabs.Products}
                      </h3>
                      <p className="mt-1 text-sm text-gray-300">
                        Please Add Some {Tabs.Products} to See Them Here.
                      </p>
                    </div>
                  </div>
                )}
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
        {state.currentTab === Tabs.Staff && (
          <div>
            <div className="flex w-full self-end px-6"></div>
            <div className="rounded-lg border border-gray-700">
              <table className="table w-full overflow-hidden">
                <thead>
                  <tr>
                    <th></th>
                    <th>Staff ID:</th>
                    <th>Email</th>
                    <th>Member Since</th>
                    <th>Orders</th>
                    <th>Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {staffData && staffData.length > 0 ? (
                    staffData.map((customer) => (
                      <tr className="text-sm" key={customer.id}>
                        <th></th>
                        <td>{customer.id}</td>
                        <td className="items-center justify-center overflow-hidden">
                          {customer.email}
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
                        <td>{customer.orders.length || 0}</td>
                        <td>{customer.payments.length || 0}</td>
                      </tr>
                    ))
                  ) : staff.length > 0 ? (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No Search Results Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Edit Your Search Query and Try Again.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No {Tabs.Staff}
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Add Some {Tabs.Staff} to See Them Here.
                        </p>
                      </div>
                    </div>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th></th>
                    <th>Staff ID:</th>
                    <th>Email</th>
                    <th>Member Since</th>
                    <th>Orders</th>
                    <th>Payments</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {state.currentTab === Tabs.Customers && (
          <div>
            <div className="flex w-full self-end px-6"></div>
            <div className="rounded-lg border border-gray-700">
              <table className="table w-full overflow-hidden">
                <thead>
                  <tr>
                    <th></th>
                    <th>Customer ID:</th>
                    <th>Email</th>
                    <th>Customer Since</th>
                    <th>Orders</th>
                    <th>Payments</th>
                  </tr>
                </thead>
                <tbody className="">
                  {customerData && customerData.length > 0 ? (
                    customerData.map((customer) => (
                      <tr className="text-sm" key={customer.id}>
                        <th></th>
                        <td>{customer.id}</td>
                        <td className="items-center justify-center overflow-hidden">
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
                          <div className="btn btn-ghost btn-xs opacity-60 hover:opacity-100">
                            {customer.orders.length || 0}
                          </div>
                        </td>
                        <td>
                          <div className="btn btn-ghost btn-xs opacity-60 hover:opacity-100">
                            {customer.payments.length || 0}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : customers.length > 0 ? (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No Search Results Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Edit Your Search Query and Try Again.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No {Tabs.Customers}
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Add Some {Tabs.Customers} to See Them Here.
                        </p>
                      </div>
                    </div>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th></th>
                    <th>Customer ID:</th>
                    <th>Email</th>
                    <th>Customer Since</th>
                    <th>Orders</th>
                    <th>Payments</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {state.currentTab === Tabs.Payments && (
          <div>
            <div className="flex w-full self-end px-6"></div>
            <div className="rounded-lg border border-gray-700">
              <table className="table w-full overflow-hidden">
                <thead>
                  <tr>
                    <th></th>
                    <th>Payment ID:</th>
                    <th>StripeID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsData && paymentsData.length > 0 ? (
                    paymentsData.map((payment) => (
                      <tr className="text-sm" key={payment.id}>
                        <th></th>
                        <td>
                          <div>{payment.id}</div>
                        </td>
                        <td className="items-center justify-center overflow-hidden">
                          {payment.stripeId || "N/A"}
                        </td>
                        <td className="hidden h-full xl:table-cell">
                          {format(
                            parseISO(payment.createdAt.toString()),
                            "PPpp"
                          )}
                        </td>
                        <td className="h-full xl:hidden">
                          {format(parseISO(payment.createdAt.toString()), "PP")}
                        </td>
                        <td>{currency(payment.amount)}</td>
                        <td className="uppercase">{payment.currency}</td>
                      </tr>
                    ))
                  ) : payments.length > 0 ? (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No Search Results Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Edit Your Search Query and Try Again.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto my-20 flex w-screen justify-center">
                      <div className="text-center">
                        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-400">
                          No {Tabs.Payments}
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          Please Add Some {Tabs.Payments} to See Them Here.
                        </p>
                      </div>
                    </div>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th></th>
                    <th>Payment ID:</th>
                    <th>StripeID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Currency</th>
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
  const products = await prisma.product.findMany({
    include: {
      order: true,
    },
  });
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      product: {
        include: {
          product: true,
        },
      },
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
  const staff = await prisma.user.findMany({
    where: { role: "OWNER" },
    include: {
      orders: true,
      payments: true,
    },
  });
  const payments = await prisma.payment.findMany({});

  const totalPayments = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
  });

  const totalOrders = await prisma.order.count();
  const totalUsers = await prisma.user.count();
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      orders: JSON.parse(JSON.stringify(orders)),
      customers: JSON.parse(JSON.stringify(customers)),
      staff: JSON.parse(JSON.stringify(staff)),
      payments: JSON.parse(JSON.stringify(payments)),
      totalPayments: totalPayments._sum.amount,
      totalOrders: totalOrders,
      totalUsers: totalUsers,
    },
  };
});

const Badge = ({ text }: { text: string }) => {
  const className = text === "COMPLETE" ? "badge-secondary" : "badge-accent";
  return <div className={`${className} badge-outline badge`}>{text}</div>;
};
