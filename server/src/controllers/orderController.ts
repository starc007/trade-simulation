import { Request, Response, NextFunction } from "express";
import { orderSchema } from "../types/trading";
import { matchingEngine } from "../services/matchingEngine";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

/**
 * Creates a new order in the trading system
 * @param req - Express request object containing order details in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * Request body should contain:
 * - side: 'BUY' | 'SELL'
 * - type: 'LIMIT' | 'MARKET'
 * - price: string (decimal)
 * - quantity: string (decimal)
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderData = orderSchema.parse(req.body);
    const { order, trades } = matchingEngine.placeOrder(orderData);

    logger.info(`Order created: ${order.id}`, {
      orderId: order.id,
      side: order.side,
      type: order.type,
      price: order.price.toString(),
      quantity: order.quantity.toString(),
      trades: trades.length,
    });

    res.status(201).json({
      status: "success",
      data: {
        order,
        trades,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancels an existing order in the trading system
 * @param req - Express request object containing orderId in params
 * @param res - Express response object
 * @param next - Express next function for error handling
 *
 * URL params:
 * - orderId: string (UUID of the order to cancel)
 */
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const success = matchingEngine.cancelOrder(orderId);

    if (!success) {
      throw new AppError(404, "Order not found or already filled");
    }

    logger.info(`Order cancelled: ${orderId}`, { orderId });

    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
