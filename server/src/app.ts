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

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(requestLogger);

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/orderbook", orderbookRoutes);
app.use("/api/trades", tradeRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
