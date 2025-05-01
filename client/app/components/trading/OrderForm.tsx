import { motion } from "framer-motion";
import { useState } from "react";
import { OrderFormData, TradingPair } from "../../types/trading";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { tradingApi } from "../../lib/api";

interface OrderFormProps {
  onOrderCreated: () => void;
}

const DECIMAL_REGEX = /^\d*\.?\d+$/;

export const OrderForm = ({ onOrderCreated }: OrderFormProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    pair: "BTC/USDC",
    side: "BUY",
    price: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    price?: string;
    amount?: string;
  }>({});

  const validateDecimal = (value: string, field: string) => {
    if (!value) return "This field is required";
    if (!DECIMAL_REGEX.test(value)) {
      return "Please enter a valid number (e.g., 123.45)";
    }
    if (parseFloat(value) <= 0) {
      return "Value must be greater than 0";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    // Validate inputs
    const priceError = validateDecimal(formData.price, "price");
    const amountError = validateDecimal(formData.amount, "amount");

    if (priceError || amountError) {
      setValidationErrors({
        price: priceError,
        amount: amountError,
      });
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        account_id: "1",
        pair: formData.pair,
        side: formData.side,
        limit_price: formData.price,
        amount: formData.amount,
      };

      console.log("Submitting order:", orderData); // Debug log

      await tradingApi.createOrder(orderData);
      setFormData({ ...formData, price: "", amount: "" });
      onOrderCreated();
    } catch (err: any) {
      console.error("Order creation error:", err);
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/40 rounded-2xl p-4"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create Order</h2>
        <p className="text-sm text-secondary">
          Place a new limit order to buy or sell.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Trading Pair
            </label>
            <select
              value={formData.pair}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pair: e.target.value as TradingPair,
                })
              }
              className="w-full rounded-xl border border-border/50 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary duration-200"
            >
              <option value="SOL/USDC">SOL/USDC</option>
              <option value="BTC/USDC">BTC/USDC</option>
            </select>
            <p className="text-xs text-secondary mt-1">
              Select the trading pair you want to trade
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Side
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.side === "BUY" ? "primary" : "secondary"}
                onClick={() => setFormData({ ...formData, side: "BUY" })}
                className="w-full"
              >
                Buy
              </Button>
              <Button
                type="button"
                variant={formData.side === "SELL" ? "primary" : "secondary"}
                onClick={() => setFormData({ ...formData, side: "SELL" })}
                className="w-full"
              >
                Sell
              </Button>
            </div>
            <p className="text-xs text-secondary mt-1">
              Choose whether you want to buy or sell
            </p>
          </div>
        </div>

        <div>
          <Input
            type="text"
            name="price"
            inputMode="decimal"
            value={formData.price}
            onChange={handleInputChange}
            label="Price"
            error={validationErrors.price}
            required
          />
          <p className="text-xs text-secondary mt-1">
            Enter the price in USDC at which you want to{" "}
            {formData.side.toLowerCase()}
          </p>
        </div>

        <div>
          <Input
            type="text"
            name="amount"
            inputMode="decimal"
            value={formData.amount}
            onChange={handleInputChange}
            label="Amount"
            error={validationErrors.amount}
            required
          />
          <p className="text-xs text-secondary mt-1">
            Enter the amount of {formData.pair.split("/")[0]} you want to{" "}
            {formData.side.toLowerCase()}
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm"
          >
            {error}
          </motion.p>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Order"}
          </Button>
          <p className="text-xs text-secondary mt-2 text-center">
            Your order will be placed immediately when you click the button
            above
          </p>
        </div>
      </form>
    </motion.div>
  );
};
