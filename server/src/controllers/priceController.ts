import { Request, Response } from "express";
import { Trade } from "../types/trading";
import { readTrades } from "../services/fileService";

const aggregatePriceData = (trades: Trade[]) => {
  return trades.reduce((acc, trade) => {
    const timestamp = new Date(trade.timestamp);
    timestamp.setSeconds(0, 0);

    const key = timestamp.toISOString();
    if (!acc[key]) {
      acc[key] = {
        timestamp,
        price: parseFloat(trade.price),
        volume: parseFloat(trade.amount),
      };
    } else {
      const totalVolume = acc[key].volume + parseFloat(trade.amount);
      acc[key].price =
        (acc[key].price * acc[key].volume +
          parseFloat(trade.price) * parseFloat(trade.amount)) /
        totalVolume;
      acc[key].volume = totalVolume;
    }
    return acc;
  }, {} as Record<string, { timestamp: Date; price: number; volume: number }>);
};

export const getHistoricalPrices = async (req: Request, res: Response) => {
  try {
    const { timeframe = "24H" } = req.query;
    const trades = await readTrades();
    const now = new Date();
    const timeframeMap: { [key: string]: number } = {
      "1H": 60 * 60 * 1000,
      "24H": 24 * 60 * 60 * 1000,
      "7D": 7 * 24 * 60 * 60 * 1000,
    };

    const timeframeMs =
      timeframeMap[timeframe as string] || timeframeMap["24H"];
    const cutoffTime = new Date(now.getTime() - timeframeMs);

    const filteredTrades = trades.filter(
      (trade) => new Date(trade.timestamp) >= cutoffTime
    );

    const priceData = aggregatePriceData(filteredTrades);
    res.json({ prices: priceData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch historical prices" });
  }
};
