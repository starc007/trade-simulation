import { Order } from "../types/trading";
import { MatchingEngine } from "../services/matchingEngine";

describe("MatchingEngine", () => {
  let engine: MatchingEngine;

  beforeEach(() => {
    engine = new MatchingEngine();
  });

  test("should match buy and sell orders at same price", () => {
    // Create a simple buy and sell order at the same price
    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000",
      side: "BUY",
    };

    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "2",
      amount: "1.0",
      order_id: "2",
      pair: "BTC/USDC",
      limit_price: "50000",
      side: "SELL",
    };

    // Process the sell order first (no match yet)
    const sellTrades = engine.processOrder(sellOrder);
    expect(sellTrades).toHaveLength(0);

    // Verify the sell order is in the orderbook
    const orderBookAfterSell = engine.getOrderBook();
    expect(orderBookAfterSell["BTC/USDC"].sell).toHaveLength(1);
    expect(orderBookAfterSell["BTC/USDC"].buy).toHaveLength(0);

    // Process the buy order (should match)
    const buyTrades = engine.processOrder(buyOrder);

    // Verify a trade was created
    expect(buyTrades).toHaveLength(1);
    expect(buyTrades[0].price).toBe("50000");
    expect(buyTrades[0].amount).toBe("1.0");
    expect(buyTrades[0].maker_order_id).toBe("2");
    expect(buyTrades[0].taker_order_id).toBe("1");

    // Verify both orders are now gone from the orderbook
    const finalOrderBook = engine.getOrderBook();
    expect(finalOrderBook["BTC/USDC"].sell).toHaveLength(0);
    expect(finalOrderBook["BTC/USDC"].buy).toHaveLength(0);
  });

  test("should correctly handle partial fills", () => {
    // Create a sell order with 2.0 BTC
    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "2.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000",
      side: "SELL",
    };

    // Create a buy order with 1.0 BTC
    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "2",
      amount: "1.0",
      order_id: "2",
      pair: "BTC/USDC",
      limit_price: "50000",
      side: "BUY",
    };

    // Process sell order first
    engine.processOrder(sellOrder);

    // Process buy order (should partially fill sell order)
    const trades = engine.processOrder(buyOrder);

    // Verify the trade
    expect(trades).toHaveLength(1);
    expect(trades[0].amount).toBe("1.0");

    // Verify the remainder in the orderbook
    const orderBook = engine.getOrderBook();
    expect(orderBook["BTC/USDC"].sell).toHaveLength(1);
    expect(orderBook["BTC/USDC"].sell[0].amount).toBe("1.0"); // 2.0 - 1.0 = 1.0 remaining
    expect(orderBook["BTC/USDC"].buy).toHaveLength(0); // Buy order fully matched
  });

  test("should process DELETE operations", () => {
    // Create a sell order
    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000",
      side: "SELL",
    };

    // Process the sell order
    engine.processOrder(sellOrder);

    // Verify the order is in the book
    let orderBook = engine.getOrderBook();
    expect(orderBook["BTC/USDC"].sell).toHaveLength(1);

    // Delete the order
    const deleteOrder: Order = {
      ...sellOrder,
      type_op: "DELETE",
    };

    engine.processOrder(deleteOrder);

    // Verify the order is gone
    orderBook = engine.getOrderBook();
    expect(orderBook["BTC/USDC"].sell).toHaveLength(0);
  });
});
