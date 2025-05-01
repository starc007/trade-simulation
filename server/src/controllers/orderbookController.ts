import { Request, Response, NextFunction } from "express";
import { matchingEngine } from "../services/matchingEngine";
import { logger } from "../utils/logger";

/**
 * Retrieves the current state of the orderbook
 */
export const getOrderBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderBook = matchingEngine.getOrderBook();

    logger.info("Orderbook retrieved", {
      bids: orderBook.bids.length,
      asks: orderBook.asks.length,
    });

    res.status(200).json({
      status: "success",
      data: orderBook,
    });
  } catch (error) {
    next(error);
  }
};
