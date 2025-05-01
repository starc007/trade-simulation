import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  orderbook: {
    maxPriceLevels: 100,
    maxOrdersPerLevel: 1000,
  },
  matching: {
    pricePrecision: 8,
    quantityPrecision: 8,
  },
} as const;

export type Config = typeof config;
