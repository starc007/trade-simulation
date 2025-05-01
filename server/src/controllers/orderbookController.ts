import { Request, Response, NextFunction } from "express";
import { readOrderBook, writeOrderBook } from "../services/fileService";
import { matchingEngine } from "../services/matchingEngine";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/errorHandler";

/**
 * Get the current orderbook state
 */
export const getOrderBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderbook = matchingEngine.getOrderBook();
    res.json({
      success: true,
      orderbook,
    });
  } catch (error) {
    next(new AppError(500, "Failed to fetch orderbook"));
  }
};

/**
 * Reset the orderbook to empty state
 */
export const resetOrderBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const emptyOrderbook = {};
    await writeOrderBook(emptyOrderbook);

    logger.info("Orderbook reset", {
      action: "reset_orderbook",
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Orderbook reset successfully",
      orderbook: emptyOrderbook,
    });
  } catch (error) {
    next(new AppError(500, "Failed to reset orderbook"));
  }
};
