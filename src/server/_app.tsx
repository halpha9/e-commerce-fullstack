import { serverRouter } from "./auth";
import { orderRouter } from "./order";
import { productRouter } from "./product";
import { router } from "./trpc";
import { userRouter } from "./user";

export const appRouter = router({
  auth: serverRouter,
  product: productRouter,
  user: userRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
