import { Request, Response } from "express";
import { readOrderBook, writeOrderBook } from "../services/fileService";
import { matchingEngine } from "../services/matchingEngine";
import { logger } from "../utils/logger";

export const orderbookController = {
  // Get the current orderbook
  async getOrderBook(req: Request, res: Response) {
    try {
      const orderbook = matchingEngine.getOrderBook();
      res.json({
        success: true,
        orderbook,
      });
    } catch (error) {
      logger.error("Error getting orderbook:", error);
      res.status(500).json({
        success: false,
        message: "Error getting orderbook",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Reset the orderbook to empty state
  async resetOrderBook(req: Request, res: Response) {
    try {
      const emptyOrderbook = {};
      await writeOrderBook(emptyOrderbook);

      res.json({
        success: true,
        message: "Orderbook reset successfully",
        orderbook: emptyOrderbook,
      });
    } catch (error) {
      logger.error("Error resetting orderbook:", error);
      res.status(500).json({
        success: false,
        message: "Error resetting orderbook",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
