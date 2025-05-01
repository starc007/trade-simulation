import { Router } from "express";
import { getOrderBook } from "../controllers/orderbookController";

const router = Router();

// Get the current orderbook
router.get("/", getOrderBook);

export const orderbookRoutes = router;
