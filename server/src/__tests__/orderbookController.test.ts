import { Request, Response } from "express";
import {
  getOrderBook,
  resetOrderBook,
} from "../controllers/orderbookController";
import { matchingEngine } from "../services/matchingEngine";
import { AppError } from "../middleware/errorHandler";

// Mock the matching engine
jest.mock("../services/matchingEngine", () => ({
  matchingEngine: {
    getOrderBook: jest.fn(),
  },
}));

// Mock file service
jest.mock("../services/fileService", () => ({
  writeOrderBook: jest.fn(),
}));

describe("OrderbookController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("getOrderBook", () => {
    it("should get the orderbook successfully", async () => {
      const mockOrderbook = {
        "BTC/USDC": {
          buy: [],
          sell: [],
        },
      };
      (matchingEngine.getOrderBook as jest.Mock).mockReturnValue(mockOrderbook);

      await getOrderBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(matchingEngine.getOrderBook).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        orderbook: mockOrderbook,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      (matchingEngine.getOrderBook as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await getOrderBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("resetOrderBook", () => {
    it("should reset the orderbook successfully", async () => {
      const emptyOrderbook = {};
      (matchingEngine.getOrderBook as jest.Mock).mockReturnValue(
        emptyOrderbook
      );

      await resetOrderBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Orderbook reset successfully",
        orderbook: emptyOrderbook,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      const { writeOrderBook } = require("../services/fileService");
      (writeOrderBook as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await resetOrderBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
