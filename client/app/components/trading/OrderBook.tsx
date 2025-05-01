import { motion } from "framer-motion";
import { Order } from "../../types/trading";

interface OrderBookProps {
  pair: string;
  buy: Order[];
  sell: Order[];
}

const OrderRow = ({ order, total }: { order: Order; total: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="grid grid-cols-3 gap-4 py-2 text-sm hover:bg-gray-50/50 transition-colors"
  >
    <span className={order.side === "BUY" ? "text-success" : "text-error"}>
      {parseFloat(order.limit_price).toLocaleString()}
    </span>
    <span className="text-secondary">
      {parseFloat(order.amount).toFixed(4)}
    </span>
    <span className="text-secondary/70">{parseFloat(total).toFixed(4)}</span>
  </motion.div>
);

const calculateTotal = (orders: Order[], index: number): string => {
  const total = orders
    .slice(0, index + 1)
    .reduce((sum, order) => sum + parseFloat(order.amount), 0);
  return total.toFixed(4);
};

export const OrderBook = ({ pair, buy, sell }: OrderBookProps) => {
  const sortedBuy = [...buy].sort(
    (a, b) => parseFloat(b.limit_price) - parseFloat(a.limit_price)
  );
  const sortedSell = [...sell].sort(
    (a, b) => parseFloat(a.limit_price) - parseFloat(b.limit_price)
  );

  return (
    <div className="border border-border/40 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-accent">Order Book</h2>
        <span className="text-sm font-medium text-secondary bg-gray-50 px-3 py-1 rounded-full">
          {pair}
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <div className="grid grid-cols-3 gap-4 text-xs text-secondary/70 mb-3 px-1">
            <span>Price</span>
            <span>Amount</span>
            <span>Total</span>
          </div>

          <div className="space-y-0.5">
            {sortedSell.map((order, index) => (
              <OrderRow
                key={`sell-${order.order_id}`}
                order={order}
                total={calculateTotal(sortedSell, index)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-border/40 pt-6">
          <div className="space-y-0.5">
            {sortedBuy.map((order, index) => (
              <OrderRow
                key={`buy-${order.order_id}`}
                order={order}
                total={calculateTotal(sortedBuy, index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
