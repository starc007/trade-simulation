export type OrderSide = "BUY" | "SELL";
export type OrderOperation = "CREATE" | "DELETE";

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
  type_op: OrderOperation;
  account_id: string;
  amount: string;
  order_id: string;
  pair: string;
  limit_price: string;
  side: OrderSide;
}

export interface Trade {
  side: OrderSide;
  trade_id: string;
  timestamp: number;
  pair: string;
  price: string;
  amount: string;
  maker_order_id: string;
  taker_order_id: string;
  maker_account_id: string;
  taker_account_id: string;
}

export interface OrderBookLevel {
  price: string;
  total_amount: string;
  orders: Order[];
}

export interface OrderBook {
  [pair: string]: {
    buy: Order[];
    sell: Order[];
  };
}
