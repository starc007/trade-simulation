import { motion } from "framer-motion";
import { Trade } from "../../types/trading";

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeRow = ({ price, amount, timestamp, side }: Trade) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="grid grid-cols-4 gap-4 py-2.5 text-sm border-b border-border/40 last:border-0 hover:bg-gray-50/50 transition-colors"
  >
    <span className={side === "BUY" ? "text-success" : "text-error"}>
      {parseFloat(price).toLocaleString()}
    </span>
    <span className="text-secondary">{parseFloat(amount).toFixed(4)}</span>
    <span className="text-secondary/70">
      {new Date(timestamp).toLocaleTimeString()}
    </span>
    <span className={side === "BUY" ? "text-success" : "text-error"}>
      {side}
    </span>
  </motion.div>
);

export const TradeHistory = ({ trades }: TradeHistoryProps) => {
  return (
    <div className="border border-border/40 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-accent">Trade History</h2>
        <span className="text-sm font-medium text-secondary bg-gray-50 px-3 py-1 rounded-full">
          Recent Trades
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 text-xs text-secondary/70 mb-3 px-1">
        <span>Price</span>
        <span>Amount</span>
        <span>Time</span>
        <span>Side</span>
      </div>

      <div className="space-y-0.5">
        {trades.map((trade, index) => (
          <TradeRow key={`trade-${index}`} {...trade} />
        ))}
      </div>
    </div>
  );
};
