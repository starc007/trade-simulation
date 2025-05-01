import { Order, OrderBook, OrderSide } from "../types/trading";
import Decimal from "decimal.js";

export class OrderBookManager {
  private orderBook: OrderBook = {};

  constructor() {}

  // Initialize orderbook with pairs
  initializeOrderBook(pair: string) {
    if (!this.orderBook[pair]) {
      this.orderBook[pair] = {
        buy: [],
        sell: [],
      };
    }
  }

  // Get the current state of the orderbook
  getOrderBook(): OrderBook {
    return this.orderBook;
  }

  // Add order to the orderbook with proper sorting
  addOrder(order: Order): void {
    const { pair, side } = order;
    const orderSide = side.toLowerCase() as Lowercase<OrderSide>;

    this.initializeOrderBook(pair);

    // Clone the order to prevent mutation issues
    const orderToAdd = { ...order };

    // Insert with price-time priority
    if (side === "BUY") {
      // Buy orders sorted by price descending (highest first)
      this.orderBook[pair].buy.push(orderToAdd);
      this.orderBook[pair].buy.sort((a, b) =>
        new Decimal(b.limit_price).minus(a.limit_price).toNumber()
      );
    } else {
      // Sell orders sorted by price ascending (lowest first)
      this.orderBook[pair].sell.push(orderToAdd);
      this.orderBook[pair].sell.sort((a, b) =>
        new Decimal(a.limit_price).minus(b.limit_price).toNumber()
      );
    }
  }

  // Remove order from the orderbook
  removeOrder(order: Order): boolean {
    const { pair, side, order_id } = order;
    const orderSide = side.toLowerCase() as Lowercase<OrderSide>;

    if (!this.orderBook[pair]) return false;

    const orders = this.orderBook[pair][orderSide];
    const index = orders.findIndex((o) => o.order_id === order_id);

    if (index !== -1) {
      orders.splice(index, 1);
      return true;
    }

    return false;
  }

  // Update order amount in the orderbook
  updateOrderAmount(
    orderId: string,
    pair: string,
    side: OrderSide,
    newAmount: string
  ): boolean {
    const orderSide = side.toLowerCase() as Lowercase<OrderSide>;

    if (!this.orderBook[pair]) return false;

    const orders = this.orderBook[pair][orderSide];
    const index = orders.findIndex((o) => o.order_id === orderId);

    if (index !== -1) {
      orders[index].amount = newAmount;
      return true;
    }

    return false;
  }

  // Find order by ID
  findOrder(orderId: string, pair: string, side: OrderSide): Order | null {
    const orderSide = side.toLowerCase() as Lowercase<OrderSide>;

    if (!this.orderBook[pair]) return null;

    const orders = this.orderBook[pair][orderSide];
    return orders.find((o) => o.order_id === orderId) || null;
  }
}
