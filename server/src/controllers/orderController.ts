import { Request, Response, NextFunction } from "express";
import { Order, OrderOperation, OrderSide } from "../types/trading";
import { matchingEngine } from "../services/matchingEngine";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import {
  readOrders,
  writeOrderBook,
  writeTrades,
} from "../services/fileService";

/**
 * Process all orders from the data file
 */
export const processOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await readOrders();
    const trades: any[] = [];

    // Process each order
    for (const order of orders) {
      const orderTrades = matchingEngine.processOrder(order);
      trades.push(...orderTrades);
    }

    // Write updated orderbook and trades to files
    await writeOrderBook(matchingEngine.getOrderBook());
    await writeTrades(trades);

    res.json({
      success: true,
      message: `Processed ${orders.length} orders`,
      trades: trades.length,
      orderbook: matchingEngine.getOrderBook(),
    });
  } catch (error) {
    next(new AppError(500, "Failed to process orders"));
  }
};

/**
 * Get all orders from the data file
 */
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await readOrders();
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(new AppError(500, "Failed to fetch orders"));
  }
};

/**
 * Create a new order
 * @throws {AppError} If required fields are missing or invalid
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { order_id, account_id, amount, pair, limit_price, side } = req.body;

    // Validate required fields
    if (!order_id || !account_id || !amount || !pair || !limit_price || !side) {
      throw new AppError(400, "Missing required fields for order creation");
    }

    // Validate side
    if (!["BUY", "SELL"].includes(side)) {
      throw new AppError(400, "Invalid order side. Must be 'BUY' or 'SELL'");
    }

    const order: Order = {
      type_op: "CREATE",
      order_id,
      account_id,
      amount,
      pair,
      limit_price,
      side: side as OrderSide,
    };

    const trades = matchingEngine.processOrder(order);

    // Write updated orderbook and trades to files
    await writeOrderBook(matchingEngine.getOrderBook());
    if (trades.length > 0) {
      await writeTrades(trades);
    }

    logger.info(`Order created: ${order_id}`, {
      orderId: order_id,
      side,
      amount,
      price: limit_price,
      trades: trades.length,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      trades,
      orderbook: matchingEngine.getOrderBook(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, "Failed to create order"));
    }
  }
};

/**
 * Delete an order
 * @throws {AppError} If order ID is missing or invalid
 */
export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { order_id, account_id, side } = req.body;

    // Validate required fields
    if (!order_id || !account_id || !side) {
      throw new AppError(400, "Missing required fields for order deletion");
    }

    // Validate side
    if (!["BUY", "SELL"].includes(side)) {
      throw new AppError(400, "Invalid order side. Must be 'BUY' or 'SELL'");
    }

    const order: Order = {
      type_op: "DELETE",
      order_id,
      account_id,
      side: side as OrderSide,
      amount: "0", // Amount is not needed for deletion
      pair: req.body.pair || "",
      limit_price: "0", // Price is not needed for deletion
    };

    matchingEngine.processOrder(order);

    // Write updated orderbook to file
    await writeOrderBook(matchingEngine.getOrderBook());

    logger.info(`Order deleted: ${order_id}`, {
      orderId: order_id,
      side,
    });

    res.json({
      success: true,
      message: "Order deleted successfully",
      orderbook: matchingEngine.getOrderBook(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(500, "Failed to delete order"));
    }
  }
};
