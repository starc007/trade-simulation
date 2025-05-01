import { Router } from "express";
import { createOrder, cancelOrder } from "../controllers/orderController";

const router = Router();

// Create a new order
router.post("/", createOrder);

// Cancel an order
router.delete("/:orderId", cancelOrder);

export const orderRoutes = router;
