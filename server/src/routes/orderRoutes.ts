import { Router } from "express";
import { createOrder, deleteOrder } from "../controllers/orderController";
import { validate } from "../middleware/validationMiddleware";
import {
  createOrderSchema,
  deleteOrderSchema,
} from "../utils/validationSchemas";

const router = Router();

// Create a new order
router.post("/", validate(createOrderSchema), createOrder);

// Cancel an order
router.post("/:orderId", validate(deleteOrderSchema), deleteOrder);

export const orderRoutes = router;
