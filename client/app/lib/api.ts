import axios, { AxiosError } from "axios";
import { Order, OrderBook, Trade } from "../types/trading";

const api = axios.create({
  baseURL: "http://localhost:6969",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export const tradingApi = {
  getOrderBook: async (): Promise<{ orderbook: OrderBook }> => {
    const { data } = await api.get("/api/orderbook");
    return data;
  },

  getTrades: async (): Promise<{ trades: Trade[] }> => {
    const { data } = await api.get("/api/trades");
    return data;
  },

  createOrder: async (
    order: Omit<Order, "type_op" | "order_id">
  ): Promise<Order> => {
    const { data } = await api.post("/api/orders", order);
    return data;
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await api.delete(`/api/orders/${orderId}`);
  },
};
