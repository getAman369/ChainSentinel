import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { screenRouter } from "./api/routes/screen";
import { attestRouter } from "./api/routes/attest";
import { requestIdMiddleware, loggingMiddleware } from "./middleware/logging";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000") / 1000,
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(requestIdMiddleware);
app.use(loggingMiddleware);

const API_VERSION = "v1";

// Apply rate limiting to API routes
app.use(`/api/${API_VERSION}`, async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip || "unknown");
    next();
  } catch {
    res.status(429).json({ error: "Too many requests. Please try again later." });
  }
});

app.use(`/api/${API_VERSION}`, screenRouter);
app.use(`/api/${API_VERSION}`, attestRouter);

app.get(`/api/${API_VERSION}`, (req, res) => {
  res.json({
    service: "ChainSentinel",
    version: API_VERSION,
    endpoints: {
      screen: `POST /api/${API_VERSION}/screen`,
      attestations: `GET /api/${API_VERSION}/attestations/:address`,
      health: "GET /health",
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ChainSentinel", timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ChainSentinel API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/${API_VERSION}`);
});