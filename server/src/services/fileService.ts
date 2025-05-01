import fs from "fs/promises";
import path from "path";
import { Order, Trade, OrderBook } from "../types/trading";
import { logger } from "../utils/logger";

// Path constants
const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const ORDERBOOK_FILE = path.join(DATA_DIR, "orderbook.json");
const TRADES_FILE = path.join(DATA_DIR, "trades.json");

// Ensure data directory exists
export async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    logger.info(`Created data directory at ${DATA_DIR}`);
  }
}

// Read orders from file
export async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(data) as Order[];
  } catch (error) {
    logger.error("Error reading orders file:", error);
    return [];
  }
}

// Write orderbook to file
export async function writeOrderBook(orderbook: OrderBook): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    ORDERBOOK_FILE,
    JSON.stringify(orderbook, null, 2),
    "utf8"
  );
  logger.info("Orderbook written to file successfully");
}

// Write trades to file
export async function writeTrades(trades: Trade[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TRADES_FILE, JSON.stringify(trades, null, 2), "utf8");
  logger.info("Trades written to file successfully");
}

// Read orderbook from file
export async function readOrderBook(): Promise<OrderBook> {
  try {
    const data = await fs.readFile(ORDERBOOK_FILE, "utf8");
    return JSON.parse(data) as OrderBook;
  } catch (error) {
    logger.warn("No existing orderbook found, returning empty object");
    return {};
  }
}

// Read trades from file
export async function readTrades(): Promise<Trade[]> {
  try {
    const data = await fs.readFile(TRADES_FILE, "utf8");
    return JSON.parse(data) as Trade[];
  } catch (error) {
    logger.warn("No existing trades found, returning empty array");
    return [];
  }
}
