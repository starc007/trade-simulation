# Trading Engine

A real-time trading engine application with a client-server architecture.

## Project Structure

```
trading-engine/
├── client/         # Frontend application
├── server/         # Backend server
└── readme.md       # This file
```

## Getting Started

### Server Setup

1. go to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with your configuration:

   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm run dev (in development mode)
   ```
   The server will start on `http://localhost:6969` by default.

### Client Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the client application:
   ```bash
   npm run dev
   ```
   The client will start on `http://localhost:3001` by default.

## Available Scripts

### Server

- `npm run dev` - Start the server in development mode with hot reload
- `npm test` - Run tests

### Client

- `npm run dev` - Start the client application
