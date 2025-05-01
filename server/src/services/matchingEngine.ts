import { v4 as uuidv4 } from "uuid";
import Decimal from "decimal.js";
import {
  Order,
  OrderBook,
  OrderSide,
  OrderStatus,
  OrderType,
  Trade,
} from "../types/trading";
import { logger } from "../utils/logger";

export class MatchingEngine {
  private orderBook: OrderBook = {
    bids: [],
    asks: [],
  };
  private trades: Trade[] = [];

  constructor() {
    this.orderBook = {
      bids: [],
      asks: [],
    };
    this.trades = [];
  }

  public placeOrder(
    order: Omit<
      Order,
      "id" | "status" | "filledQuantity" | "createdAt" | "updatedAt"
    >
  ): {
    order: Order;
    trades: Trade[];
  } {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      status: OrderStatus.OPEN,
      filledQuantity: new Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const trades: Trade[] = [];

    if (order.type === OrderType.MARKET) {
      this.matchMarketOrder(newOrder, trades);
    } else {
      this.matchLimitOrder(newOrder, trades);
    }

    return { order: newOrder, trades };
  }

  private matchLimitOrder(order: Order, trades: Trade[]): void {
    const oppositeSide =
      order.side === OrderSide.BUY ? this.orderBook.asks : this.orderBook.bids;
    const sameSide =
      order.side === OrderSide.BUY ? this.orderBook.bids : this.orderBook.asks;

    // Try to match with existing orders
    while (order.status !== OrderStatus.FILLED && oppositeSide.length > 0) {
      const oppositeOrder = oppositeSide[0].orders[0];

      if (
        (order.side === OrderSide.BUY && order.price.lt(oppositeOrder.price)) ||
        (order.side === OrderSide.SELL && order.price.gt(oppositeOrder.price))
      ) {
        break;
      }

      const matchQuantity = Decimal.min(
        order.quantity.minus(order.filledQuantity),
        oppositeOrder.quantity.minus(oppositeOrder.filledQuantity)
      );

      if (matchQuantity.gt(0)) {
        const trade: Trade = {
          id: uuidv4(),
          buyOrderId:
            order.side === OrderSide.BUY ? order.id : oppositeOrder.id,
          sellOrderId:
            order.side === OrderSide.SELL ? order.id : oppositeOrder.id,
          price: oppositeOrder.price,
          quantity: matchQuantity,
          timestamp: new Date(),
        };

        trades.push(trade);
        this.trades.push(trade);

        // Update order quantities
        order.filledQuantity = order.filledQuantity.plus(matchQuantity);
        oppositeOrder.filledQuantity =
          oppositeOrder.filledQuantity.plus(matchQuantity);

        // Update order statuses
        if (order.filledQuantity.eq(order.quantity)) {
          order.status = OrderStatus.FILLED;
        } else {
          order.status = OrderStatus.PARTIALLY_FILLED;
        }

        if (oppositeOrder.filledQuantity.eq(oppositeOrder.quantity)) {
          oppositeOrder.status = OrderStatus.FILLED;
          oppositeSide[0].orders.shift();
          if (oppositeSide[0].orders.length === 0) {
            oppositeSide.shift();
          }
        }
      }
    }

    // If order is not fully filled, add to order book
    if (order.status !== OrderStatus.FILLED) {
      this.addToOrderBook(order, sameSide);
    }
  }

  private matchMarketOrder(order: Order, trades: Trade[]): void {
    const oppositeSide =
      order.side === OrderSide.BUY ? this.orderBook.asks : this.orderBook.bids;

    while (order.status !== OrderStatus.FILLED && oppositeSide.length > 0) {
      const oppositeOrder = oppositeSide[0].orders[0];
      const matchQuantity = Decimal.min(
        order.quantity.minus(order.filledQuantity),
        oppositeOrder.quantity.minus(oppositeOrder.filledQuantity)
      );

      if (matchQuantity.gt(0)) {
        const trade: Trade = {
          id: uuidv4(),
          buyOrderId:
            order.side === OrderSide.BUY ? order.id : oppositeOrder.id,
          sellOrderId:
            order.side === OrderSide.SELL ? order.id : oppositeOrder.id,
          price: oppositeOrder.price,
          quantity: matchQuantity,
          timestamp: new Date(),
        };

        trades.push(trade);
        this.trades.push(trade);

        // Update order quantities
        order.filledQuantity = order.filledQuantity.plus(matchQuantity);
        oppositeOrder.filledQuantity =
          oppositeOrder.filledQuantity.plus(matchQuantity);

        // Update order statuses
        if (order.filledQuantity.eq(order.quantity)) {
          order.status = OrderStatus.FILLED;
        } else {
          order.status = OrderStatus.PARTIALLY_FILLED;
        }

        if (oppositeOrder.filledQuantity.eq(oppositeOrder.quantity)) {
          oppositeOrder.status = OrderStatus.FILLED;
          oppositeSide[0].orders.shift();
          if (oppositeSide[0].orders.length === 0) {
            oppositeSide.shift();
          }
        }
      }
    }

    if (order.status === OrderStatus.OPEN) {
      order.status = OrderStatus.PARTIALLY_FILLED;
    }
  }

  private addToOrderBook(
    order: Order,
    side: { price: Decimal; totalQuantity: Decimal; orders: Order[] }[]
  ): void {
    const priceIndex = side.findIndex((level) => level.price.eq(order.price));

    if (priceIndex === -1) {
      // Insert new price level
      const newLevel = {
        price: order.price,
        totalQuantity: order.quantity,
        orders: [order],
      };

      const insertIndex = side.findIndex((level) =>
        order.side === OrderSide.BUY
          ? level.price.lt(order.price)
          : level.price.gt(order.price)
      );

      if (insertIndex === -1) {
        side.push(newLevel);
      } else {
        side.splice(insertIndex, 0, newLevel);
      }
    } else {
      // Add to existing price level
      side[priceIndex].orders.push(order);
      side[priceIndex].totalQuantity = side[priceIndex].totalQuantity.plus(
        order.quantity
      );
    }
  }

  public getOrderBook(): OrderBook {
    return this.orderBook;
  }

  public getTrades(): Trade[] {
    return this.trades;
  }

  public cancelOrder(orderId: string): boolean {
    const sides = [this.orderBook.bids, this.orderBook.asks];

    for (const side of sides) {
      for (const level of side) {
        const orderIndex = level.orders.findIndex(
          (order) => order.id === orderId
        );
        if (orderIndex !== -1) {
          const order = level.orders[orderIndex];
          if (order.status === OrderStatus.FILLED) {
            return false;
          }

          level.orders.splice(orderIndex, 1);
          level.totalQuantity = level.totalQuantity.minus(
            order.quantity.minus(order.filledQuantity)
          );

          if (level.orders.length === 0) {
            const levelIndex = side.findIndex((l) => l.price.eq(level.price));
            side.splice(levelIndex, 1);
          }

          return true;
        }
      }
    }

    return false;
  }
}

// Create a singleton instance
export const matchingEngine = new MatchingEngine();
