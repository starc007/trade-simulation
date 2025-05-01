import { z } from "zod";
import Decimal from "decimal.js";

export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
}

export enum OrderStatus {
  OPEN = "OPEN",
  FILLED = "FILLED",
  PARTIALLY_FILLED = "PARTIALLY_FILLED",
  CANCELLED = "CANCELLED",
}

export interface Order {
  id: string;
  side: OrderSide;
  type: OrderType;
  price: Decimal;
  quantity: Decimal;
  status: OrderStatus;
  filledQuantity: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  price: Decimal;
  quantity: Decimal;
  timestamp: Date;
}

export interface OrderBookLevel {
  price: Decimal;
  totalQuantity: Decimal;
  orders: Order[];
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

// Zod schemas for validation
export const orderSchema = z.object({
  side: z.nativeEnum(OrderSide),
  type: z.nativeEnum(OrderType),
  price: z.string().transform((val) => new Decimal(val)),
  quantity: z.string().transform((val) => new Decimal(val)),
});

export type CreateOrderRequest = z.infer<typeof orderSchema>;
