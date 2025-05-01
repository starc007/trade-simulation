"use client";

import { useTradingData } from "./hooks/useTradingData";
import { OrderBook } from "./components/trading/OrderBook";
import { TradeHistory } from "./components/trading/TradeHistory";
import { OrderForm } from "./components/trading/OrderForm";
import { Loader } from "./components/ui/Loader";
import { motion } from "framer-motion";
import { PriceChart } from "./components/trading/PriceChart";

export default function Home() {
  const { orderBook, trades, error, loading } = useTradingData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const btcUsdcOrders = orderBook?.["BTC/USDC"];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-primary mb-8">Dashboard</h1>

        <div className="flex mb-8">
          <PriceChart trades={trades} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {btcUsdcOrders && (
              <OrderBook
                pair="BTC/USDC"
                buy={btcUsdcOrders.buy}
                sell={btcUsdcOrders.sell}
              />
            )}
            <TradeHistory trades={trades} />
          </div>

          <div>
            <OrderForm onOrderCreated={() => {}} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
