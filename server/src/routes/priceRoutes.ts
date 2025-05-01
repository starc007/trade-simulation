import { Router } from "express";
import { getHistoricalPrices } from "../controllers/priceController";

const router = Router();

router.get("/historical", getHistoricalPrices);

export default router;
