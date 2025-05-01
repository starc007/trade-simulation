import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { orderRoutes } from "./routes/orderRoutes";
import { orderbookRoutes } from "./routes/orderbookRoutes";
import { tradeRoutes } from "./routes/tradeRoutes";
import { logger } from "./utils/logger";
import { matchingEngine } from "./services/matchingEngine";
import priceRoutes from "./routes/priceRoutes";

const app = express();
const PORT = config.port;

const initMiddleware = () => {
  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(requestLogger);

  // Error handling
  app.use(errorHandler);
};

const initRoutes = () => {
  app.use("/api/orders", orderRoutes);
  app.use("/api/orderbook", orderbookRoutes);
  app.use("/api/trades", tradeRoutes);
  app.use("/api/prices", priceRoutes);
};

const initTradingEngine = async () => {
  try {
    await matchingEngine.processInitialOrders();
    logger.info("Trading engine initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize trading engine:", error);
    process.exit(1);
  }
};

const initApp = () => {
  initMiddleware();
  initRoutes();
  initTradingEngine();
  // Start the server
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

initApp();

export default app;
