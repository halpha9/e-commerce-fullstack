import { serverRouter } from "./auth";
import { productRouter } from "./product";
import { router } from "./trpc";

export const appRouter = router({
  auth: serverRouter,
  product: productRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
