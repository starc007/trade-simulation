import { Request, Response } from "express";
import { createOrder, deleteOrder } from "../controllers/orderController";
import { matchingEngine } from "../services/matchingEngine";
import { AppError } from "../middleware/errorHandler";
import { Trade } from "../types/trading";

jest.mock("../services/matchingEngine", () => ({
  matchingEngine: {
    processOrder: jest.fn(),
    getOrderBook: jest.fn().mockReturnValue({}),
  },
}));

describe("OrderController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {
        order_id: "123",
        account_id: "456",
        amount: "1.0",
        pair: "BTC/USDC",
        limit_price: "50000",
        side: "BUY",
      },
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("createOrder", () => {
    it("should create an order successfully", async () => {
      const mockTrades: Trade[] = [];
      (matchingEngine.processOrder as jest.Mock).mockReturnValue(mockTrades);

      await createOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(matchingEngine.processOrder).toHaveBeenCalledWith({
        type_op: "CREATE",
        ...mockRequest.body,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Order created successfully",
        trades: mockTrades,
        orderbook: expect.any(Object),
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      (matchingEngine.processOrder as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await createOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("deleteOrder", () => {
    it("should delete an order successfully", async () => {
      const mockTrades: Trade[] = [];
      (matchingEngine.processOrder as jest.Mock).mockReturnValue(mockTrades);

      // Update mock request for delete operation
      mockRequest.body = {
        order_id: "123",
        account_id: "456",
        side: "BUY",
        pair: "BTC/USDC",
      };

      await deleteOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(matchingEngine.processOrder).toHaveBeenCalledWith({
        type_op: "DELETE",
        order_id: "123",
        account_id: "456",
        side: "BUY",
        pair: "BTC/USDC",
        amount: "0",
        limit_price: "0",
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Order deleted successfully",
        orderbook: expect.any(Object),
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      (matchingEngine.processOrder as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await deleteOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
