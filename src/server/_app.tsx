import { serverRouter } from "./auth";
import { productRouter } from "./product";
import { router } from "./trpc";
import { userRouter } from "./user";

export const appRouter = router({
  auth: serverRouter,
  product: productRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
