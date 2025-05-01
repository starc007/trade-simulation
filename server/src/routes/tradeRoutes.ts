import { Router } from "express";
import { getTrades } from "../controllers/tradeController";

const router = Router();

// Get trade history
router.get("/", getTrades);

export const tradeRoutes = router;
