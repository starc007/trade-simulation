import { z } from "zod";

// Common schemas
const orderSideSchema = z.enum(["BUY", "SELL"]);
const uuidSchema = z.string().uuid();
const decimalSchema = z.string().min(1);

// Create Order Schema
export const createOrderSchema = z.object({
  account_id: z.string().min(1),
  amount: decimalSchema,
  pair: z.string().min(1),
  limit_price: decimalSchema,
  side: orderSideSchema,
});

// Delete Order Schema
export const deleteOrderSchema = z.object({
  order_id: uuidSchema,
  account_id: z.string().min(1),
  side: orderSideSchema,
  pair: z.string().min(1).optional(),
});
