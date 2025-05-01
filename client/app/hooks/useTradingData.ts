import { useEffect, useState } from "react";
import { OrderBook, Trade } from "../types/trading";
import { tradingApi } from "../lib/api";

export const useTradingData = (pollingInterval = 1000) => {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderBookData, tradesData] = await Promise.all([
          tradingApi.getOrderBook(),
          tradingApi.getTrades(),
        ]);

        setOrderBook(orderBookData?.orderbook);
        setTrades(tradesData?.trades);
        setError(null);
      } catch (err) {
        setError("Failed to fetch trading data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { orderBook, trades, error, loading };
};
