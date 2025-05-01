import { Request, Response, NextFunction } from "express";
import { readTrades, writeTrades } from "../services/fileService";
import { matchingEngine } from "../services/matchingEngine";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/errorHandler";

/**
 * Get all trades from the matching engine
 */
export const getTrades = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trades = matchingEngine.getTrades();
    res.json({
      success: true,
      trades,
    });
  } catch (error) {
    next(new AppError(500, "Failed to fetch trades"));
  }
};

/**
 * Reset trades history
 */
export const resetTrades = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const emptyTrades: any[] = [];
    await writeTrades(emptyTrades);

    logger.info("Trades history reset", {
      action: "reset_trades",
      tradesCount: 0,
    });

    res.json({
      success: true,
      message: "Trades history reset successfully",
      trades: emptyTrades,
    });
  } catch (error) {
    next(new AppError(500, "Failed to reset trades history"));
  }
};
