import { z } from "zod";

export const orderSchema = z.object({
  id: z.string(),
  productId: z.string(),
  address: z.string(),
  status: z.string(),
  quantity: z.number(),
});

export const productSchema = z.object({
  where: z.object({
    order: orderSchema,
  }),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number(),
});
