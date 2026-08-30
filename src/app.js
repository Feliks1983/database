const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const apiRouter = require("./routes/todos");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { requestLogger } = require("./middleware/requestLogger");
const { getConnectionStatus, connectDB } = require("./config/database");

dotenv.config();

const app = express();

const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  const dbStatus = getConnectionStatus();

  res.status(dbStatus.connected ? 200 : 500).json({
    success: dbStatus.connected,
    status: dbStatus.connected ? "OK" : "NOT",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Todo REST API",
    version: "1.0.0",
    description: "REST API for managing Todo tasks",
    environment: config.port,
    links: {
      todos: "/",
    },
  });
});
app.use("/api/todos", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(
        `Server running on port ${config.port} in ${config.nodeEnv} mode`,
      );

      console.log(`API: http://localhost:${config.port}`);

      console.log(`Todos: http://localhost:${config.port}/api/todos`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

module.exports = { app, startServer };
if (require.main === module) {
  startServer();
}