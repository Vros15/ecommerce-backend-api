require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("morgan");
const connectToMongoDB = require("./database/connectToMongoDB");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Render and other managed platforms terminate TLS and proxy requests.
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many requests, please try again later.",
    details: null,
  },
});

const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(logger(`dev`));
app.use("/api", limiter);

// A long-running server connects once before listening, so this resolves from
// cache. On serverless there is no startup phase, so every request ensures the
// connection itself. Mounted under /api so /health stays free of the database.
app.use("/api", async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
  });
});

app.get("/ready", async (req, res) => {
  const notReady = {
    success: false,
    code: "NOT_READY",
    message: "Database connection is not ready.",
  };

  // Attempt the connection rather than only inspecting readyState. On serverless
  // a cold invocation has not connected yet and would otherwise always report 503.
  try {
    await connectToMongoDB();
  } catch {
    return res.status(503).json(notReady);
  }

  // Guards the case where a cached connection has since dropped.
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json(notReady);
  }

  return res.status(200).json({
    success: true,
    message: "Service is ready",
  });
});

app.use("/api/customers", require("./routes/customersRouter"));
app.use("/api/products", require("./routes/productsRouter"));
app.use("/api/carts", require("./routes/cartsRouter"));
app.use("/api/orders", require("./routes/ordersRouter"));
app.use("/api/checkout", require("./routes/checkoutRouter"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
