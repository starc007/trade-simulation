import { MatchingEngine } from "../services/matchingEngine";
import { Order } from "../types/trading";

describe("MatchingEngine", () => {
  let engine: MatchingEngine;

  beforeEach(() => {
    engine = new MatchingEngine("BTC/USDC");
  });

  it("should match a simple trade between buy and sell orders", () => {
    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "BUY",
    };

    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "2",
      amount: "1.0",
      order_id: "2",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "SELL",
    };

    // Process buy order first
    const trades1 = engine.processOrder(buyOrder);
    expect(trades1).toHaveLength(0); // No trades yet as there's no matching sell order

    // Process sell order
    const trades2 = engine.processOrder(sellOrder);
    expect(trades2).toHaveLength(1); // Should create one trade

    const trade = trades2[0];
    expect(trade.price).toBe("50000.00");
    expect(trade.amount).toBe("1.0");
    expect(trade.buyer_id).toBe("1");
    expect(trade.seller_id).toBe("2");

    // Verify orderbook is empty after full match
    const orderBook = engine.getOrderBook();
    expect(orderBook.bids).toHaveLength(0);
    expect(orderBook.asks).toHaveLength(0);
  });

  it("should handle partial matches correctly", () => {
    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "2.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "BUY",
    };

    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "2",
      amount: "1.0",
      order_id: "2",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "SELL",
    };

    // Process buy order first
    engine.processOrder(buyOrder);

    // Process sell order
    const trades = engine.processOrder(sellOrder);
    expect(trades).toHaveLength(1);

    const trade = trades[0];
    expect(trade.amount).toBe("1.0");

    // Verify remaining buy order in orderbook
    const orderBook = engine.getOrderBook();
    expect(orderBook.bids).toHaveLength(1);
    expect(orderBook.bids[0].orders[0].amount).toBe("1.0");
  });

  it("should handle order deletion", () => {
    const order: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "BUY",
    };

    // Add order to book
    engine.processOrder(order);

    // Delete order
    const deleteOrder: Order = {
      ...order,
      type_op: "DELETE",
    };

    engine.processOrder(deleteOrder);

    // Verify order is removed from orderbook
    const orderBook = engine.getOrderBook();
    expect(orderBook.bids).toHaveLength(0);
  });

  it("should maintain price-time priority", () => {
    // Add multiple orders at the same price
    const orders: Order[] = [
      {
        type_op: "CREATE",
        account_id: "1",
        amount: "1.0",
        order_id: "1",
        pair: "BTC/USDC",
        limit_price: "50000.00",
        side: "BUY",
      },
      {
        type_op: "CREATE",
        account_id: "2",
        amount: "1.0",
        order_id: "2",
        pair: "BTC/USDC",
        limit_price: "50000.00",
        side: "BUY",
      },
      {
        type_op: "CREATE",
        account_id: "3",
        amount: "1.0",
        order_id: "3",
        pair: "BTC/USDC",
        limit_price: "50000.00",
        side: "BUY",
      },
    ];

    // Process all buy orders
    orders.forEach((order) => engine.processOrder(order));

    // Add a matching sell order
    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "4",
      amount: "1.0",
      order_id: "4",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "SELL",
    };

    const trades = engine.processOrder(sellOrder);
    expect(trades).toHaveLength(1);

    // Verify the first buy order was matched (price-time priority)
    const trade = trades[0];
    expect(trade.buyer_id).toBe("1");
  });
});
