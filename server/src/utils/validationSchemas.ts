import { z } from "zod";

// Common schemas
const orderSideSchema = z.enum(["BUY", "SELL"]);
const uuidSchema = z.string().uuid();
const decimalSchema = z.string().regex(/^\d*\.?\d+$/);

// Create Order Schema
export const createOrderSchema = z.object({
  order_id: uuidSchema,
  account_id: uuidSchema,
  amount: decimalSchema,
  pair: z.string().min(1),
  limit_price: decimalSchema,
  side: orderSideSchema,
});

// Delete Order Schema
export const deleteOrderSchema = z.object({
  order_id: uuidSchema,
  account_id: uuidSchema,
  side: orderSideSchema,
  pair: z.string().min(1).optional(),
});

// Types derived from schemas
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type DeleteOrderInput = z.infer<typeof deleteOrderSchema>;
