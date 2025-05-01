import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { Trade } from "../../types/trading";

interface PriceChartProps {
  trades: Trade[];
  timeframe?: "1H" | "24H" | "7D";
}

export const PriceChart = ({ trades, timeframe = "24H" }: PriceChartProps) => {
  // Process trades data for the chart
  const chartData = trades
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .map((trade) => ({
      timestamp: new Date(trade.timestamp),
      price: parseFloat(trade.price),
      volume: parseFloat(trade.amount),
    }));

  return (
    <div className="rounded-2xl w-full mb-10 h-full">
      <div className="flex flex-col gap-1 mb-6">
        <span className="text-primary/50 text-sm font-medium">Price</span>
        <h2 className="text-4xl font-bold">
          ${chartData[chartData.length - 1]?.price.toFixed(2)}
        </h2>
      </div>

      <div className="flex md:flex-row flex-col md:gap-4 gap-10 w-full h-full">
        {/* Price Chart */}
        <div className="flex-1 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E559F9" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#E559F9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => format(time, "hh:mm a")}
                axisLine={false}
                tickLine={false}
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="#666"
                fontSize={12}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000",
                }}
                cursor={{ fill: "transparent" }}
                labelFormatter={(label) => format(label, "hh:mm a")}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#E559F9"
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="flex-1 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => format(time, "hh:mm a")}
                axisLine={false}
                tickLine={false}
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="#666"
                fontSize={12}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000",
                }}
                cursor={{ fill: "transparent" }}
                labelFormatter={(label) => format(label, "hh:mm a")}
                formatter={(value) => [
                  `$${Number(value).toFixed(4)}`,
                  "Volume",
                ]}
              />
              <Bar
                dataKey="volume"
                fill="#E559F9"
                radius={[4, 4, 0, 0]}
                activeBar={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
