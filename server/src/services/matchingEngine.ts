import { v4 as uuidv4 } from "uuid";
import Decimal from "decimal.js";
import { Order, OrderSide, Trade } from "../types/trading";
import { OrderBookManager } from "./orderBookManager";

export class MatchingEngine {
  private orderBook: OrderBookManager;
  private trades: Trade[] = [];

  constructor() {
    this.orderBook = new OrderBookManager();
  }

  // Process a single order
  processOrder(order: Order): Trade[] {
    if (order.type_op === "CREATE") {
      return this.matchOrder(order);
    } else if (order.type_op === "DELETE") {
      this.orderBook.removeOrder(order);
    }
    return [];
  }

  // Process multiple orders
  processOrders(orders: Order[]): void {
    for (const order of orders) {
      this.processOrder(order);
    }
  }

  // Match incoming order against the orderbook
  private matchOrder(incomingOrder: Order): Trade[] {
    const { pair, side, limit_price, amount, order_id, account_id } =
      incomingOrder;
    const newTrades: Trade[] = [];

    // Determine which side of the book to match against
    const opposingSide: OrderSide = side === "BUY" ? "SELL" : "BUY";
    const opposingSideKey = opposingSide.toLowerCase() as Lowercase<OrderSide>;

    // Initialize orderbook for this pair if needed
    this.orderBook.initializeOrderBook(pair);

    let remainingAmount = new Decimal(amount);
    let opposingOrders = this.orderBook.getOrderBook()[pair][opposingSideKey];

    // Continue matching while there's remaining amount and opposing orders
    while (remainingAmount.gt(0) && opposingOrders.length > 0) {
      const topOrder = opposingOrders[0];

      // Check if prices cross (can match)
      const incomingPrice = new Decimal(limit_price);
      const topOrderPrice = new Decimal(topOrder.limit_price);

      const canMatch =
        side === "BUY"
          ? incomingPrice.gte(topOrderPrice)
          : incomingPrice.lte(topOrderPrice);

      if (!canMatch) break;

      // Calculate trade amount (minimum of the two orders)
      const topOrderAmount = new Decimal(topOrder.amount);
      const tradeAmount = Decimal.min(remainingAmount, topOrderAmount);

      // Create trade record
      const trade: Trade = {
        trade_id: uuidv4(),
        timestamp: Date.now(),
        pair,
        price: topOrder.limit_price, // Maker sets the price
        amount: tradeAmount.toString(),
        maker_order_id: topOrder.order_id,
        taker_order_id: order_id,
        maker_account_id: topOrder.account_id,
        taker_account_id: account_id,
      };

      newTrades.push(trade);
      this.trades.push(trade);

      // Update remaining amounts
      remainingAmount = remainingAmount.minus(tradeAmount);
      const newTopOrderAmount = topOrderAmount.minus(tradeAmount);

      // Update or remove the top order
      if (newTopOrderAmount.isZero()) {
        opposingOrders.shift(); // Remove fully filled order
      } else {
        topOrder.amount = newTopOrderAmount.toString();
      }
    }

    // If there's remaining amount, add to orderbook
    if (remainingAmount.gt(0)) {
      const remainingOrder: Order = {
        ...incomingOrder,
        amount: remainingAmount.toString(),
      };
      this.orderBook.addOrder(remainingOrder);
    }

    return newTrades;
  }

  // Get current orderbook
  getOrderBook() {
    return this.orderBook.getOrderBook();
  }

  // Get all trades
  getTrades() {
    return this.trades;
  }
}

// Create a singleton instance
export const matchingEngine = new MatchingEngine();
