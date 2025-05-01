process.env.NODE_ENV = "test";

jest.mock("../utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
