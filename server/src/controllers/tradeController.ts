import { Request, Response, NextFunction } from "express";
import { matchingEngine } from "../services/matchingEngine";
import { logger } from "../utils/logger";

/**
 * Retrieves the complete trade history
 */
export const getTrades = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trades = matchingEngine.getTrades();

    logger.info("Trades retrieved", {
      count: trades.length,
    });

    res.status(200).json({
      status: "success",
      data: trades,
    });
  } catch (error) {
    next(error);
  }
};
