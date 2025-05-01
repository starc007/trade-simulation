import { MatchingEngine } from "../matchingEngine";
import { OrderSide, OrderType } from "../../types/trading";
import Decimal from "decimal.js";

describe("MatchingEngine", () => {
  let matchingEngine: MatchingEngine;

  beforeEach(() => {
    matchingEngine = new MatchingEngine();
  });

  describe("placeOrder", () => {
    it("should match a buy order with a sell order at the same price", () => {
      // Place a sell order
      const sellOrder = {
        side: OrderSide.SELL,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("1"),
      };

      const { order: placedSellOrder, trades: sellTrades } =
        matchingEngine.placeOrder(sellOrder);
      expect(sellTrades).toHaveLength(0);
      expect(placedSellOrder.status).toBe("OPEN");

      // Place a matching buy order
      const buyOrder = {
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("1"),
      };

      const { order: placedBuyOrder, trades: buyTrades } =
        matchingEngine.placeOrder(buyOrder);

      // Verify the trade
      expect(buyTrades).toHaveLength(1);
      expect(buyTrades[0].price.toString()).toBe("100");
      expect(buyTrades[0].quantity.toString()).toBe("1");
      expect(placedBuyOrder.status).toBe("FILLED");
      expect(placedSellOrder.status).toBe("FILLED");
    });

    it("should not match orders at different prices", () => {
      // Place a sell order
      const sellOrder = {
        side: OrderSide.SELL,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("1"),
      };

      const { order: placedSellOrder, trades: sellTrades } =
        matchingEngine.placeOrder(sellOrder);
      expect(sellTrades).toHaveLength(0);
      expect(placedSellOrder.status).toBe("OPEN");

      // Place a buy order at a lower price
      const buyOrder = {
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        price: new Decimal("90"),
        quantity: new Decimal("1"),
      };

      const { order: placedBuyOrder, trades: buyTrades } =
        matchingEngine.placeOrder(buyOrder);

      // Verify no trade occurred
      expect(buyTrades).toHaveLength(0);
      expect(placedBuyOrder.status).toBe("OPEN");
      expect(placedSellOrder.status).toBe("OPEN");
    });

    it("should partially fill orders when quantities differ", () => {
      // Place a sell order
      const sellOrder = {
        side: OrderSide.SELL,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("2"),
      };

      const { order: placedSellOrder, trades: sellTrades } =
        matchingEngine.placeOrder(sellOrder);
      expect(sellTrades).toHaveLength(0);
      expect(placedSellOrder.status).toBe("OPEN");

      // Place a buy order with smaller quantity
      const buyOrder = {
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("1"),
      };

      const { order: placedBuyOrder, trades: buyTrades } =
        matchingEngine.placeOrder(buyOrder);

      // Verify the trade
      expect(buyTrades).toHaveLength(1);
      expect(buyTrades[0].price.toString()).toBe("100");
      expect(buyTrades[0].quantity.toString()).toBe("1");
      expect(placedBuyOrder.status).toBe("FILLED");
      expect(placedSellOrder.status).toBe("PARTIALLY_FILLED");
      expect(placedSellOrder.filledQuantity.toString()).toBe("1");
    });
  });

  describe("cancelOrder", () => {
    it("should cancel an open order", () => {
      // Place an order
      const order = {
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("1"),
      };

      const { order: placedOrder } = matchingEngine.placeOrder(order);
      expect(placedOrder.status).toBe("OPEN");

      // Cancel the order
      const success = matchingEngine.cancelOrder(placedOrder.id);
      expect(success).toBe(true);

      // Verify the order is no longer in the orderbook
      const orderBook = matchingEngine.getOrderBook();
      expect(orderBook.bids).toHaveLength(0);
    });

    it("should not cancel a filled order", () => {
      // Place a sell order
      const sellOrder = {
        side: OrderSide.SELL,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("1"),
      };

      matchingEngine.placeOrder(sellOrder);

      // Place and match a buy order
      const buyOrder = {
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        price: new Decimal("100"),
        quantity: new Decimal("1"),
      };

      const { order: placedBuyOrder } = matchingEngine.placeOrder(buyOrder);

      // Try to cancel the filled order
      const success = matchingEngine.cancelOrder(placedBuyOrder.id);
      expect(success).toBe(false);
    });
  });
});
