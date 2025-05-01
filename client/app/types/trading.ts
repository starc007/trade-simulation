export interface Order {
  type_op: "CREATE" | "DELETE";
  account_id: string;
  amount: string;
  order_id: string;
  pair: string;
  limit_price: string;
  side: "BUY" | "SELL";
}

export interface OrderBookLevel {
  price: string;
  amount: string;
  total: string;
}

export interface Trade {
  price: string;
  amount: string;
  timestamp: string;
  side: "BUY" | "SELL";
}

export interface OrderBookPair {
  buy: Order[];
  sell: Order[];
}

export interface OrderBook {
  [pair: string]: OrderBookPair;
}

export type TradingPair = "BTC/USDC" | "ETH/USDC";

export interface OrderFormData {
  pair: TradingPair;
  side: "BUY" | "SELL";
  price: string;
  amount: string;
}
