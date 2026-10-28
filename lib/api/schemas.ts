import { z } from "zod";

export const orderSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().min(1).max(60),
    lastName: z.string().min(1).max(60),
    phone: z.string().max(30).optional(),
  }),
  shipping: z.object({
    address1: z.string().min(3).max(120),
    address2: z.string().max(120).optional(),
    city: z.string().min(1).max(80),
    region: z.string().max(80).optional(),
    postalCode: z.string().min(2).max(12),
    country: z.string().min(2).max(60),
  }),
  delivery: z.enum(["standard", "express", "pickup"]),
  payment: z.enum(["card", "cod", "wallet"]),
  discountCode: z.string().max(30).optional(),
  lines: z.array(z.object({ productId: z.string(), variantId: z.string(), qty: z.number().int().min(1).max(10) })).min(1).max(50),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});
