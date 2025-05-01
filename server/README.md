# Trading Engine Server

A high-performance trading engine server built with Express and TypeScript.

## Features

- RESTful API for order management
- Real-time order matching engine
- Price-time priority matching algorithm
- Support for limit and market orders
- Comprehensive error handling
- Request validation with Zod
- Logging with Winston
- Security with Helmet
- CORS support
- TypeScript support
- Jest testing setup

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

3. Build the project:

```bash
npm run build
```

4. Start the server:

```bash
npm start
```

For development with hot reloading:

```bash
npm run dev
```

## API Endpoints

### Orders

- `POST /api/orders` - Create a new order
- `DELETE /api/orders/:orderId` - Cancel an order

### Orderbook

- `GET /api/orderbook` - Get the current orderbook

### Trades

- `GET /api/trades` - Get trade history

### Health

- `GET /api/health` - Health check endpoint

## Testing

Run tests:

```bash
npm test
```

Run tests with watch mode:

```bash
npm run test:watch
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── app.ts          # Express app setup
```

## Error Handling

The server uses a centralized error handling mechanism with custom error classes and middleware. All errors are properly logged and formatted before being sent to the client.

## Logging

Logging is implemented using Winston with different log levels and formats for development and production environments.

## Security

- Helmet for security headers
- CORS configuration
- Input validation with Zod
- Error handling to prevent information leakage

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
