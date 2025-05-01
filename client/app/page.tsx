"use client";

import { useState } from "react";
import { useTradingData } from "./hooks/useTradingData";
import { OrderBook } from "./components/trading/OrderBook";
import { TradeHistory } from "./components/trading/TradeHistory";
import { OrderForm } from "./components/trading/OrderForm";
import { Loader } from "./components/ui/Loader";
import { Button } from "./components/ui/Button";
import { Modal } from "./components/ui/Modal";
import { motion } from "framer-motion";
import { PriceChart } from "./components/trading/PriceChart";
import { Tabs } from "./components/ui/Tabs";

const tabs = [
  { label: "Order Book", value: "orderbook" },
  { label: "Trade History", value: "history" },
];

export default function Home() {
  const { orderBook, trades, error, loading } = useTradingData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orderbook");

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
    <>
      <div className="min-h-screen container mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
            >
              Create Order
            </Button>
          </div>

          <PriceChart trades={trades} />

          <div className="w-fit">
            <Tabs
              tabs={tabs}
              active={activeTab}
              onTabChange={setActiveTab}
              className="mb-6"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "orderbook" && btcUsdcOrders && (
              <OrderBook
                pair="BTC/USDC"
                buy={btcUsdcOrders.buy}
                sell={btcUsdcOrders.sell}
              />
            )}
            {activeTab === "history" && <TradeHistory trades={trades} />}
          </motion.div>
        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <OrderForm
          onOrderCreated={() => {
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
