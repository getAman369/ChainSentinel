import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { screenRouter } from "./api/routes/screen";
import { attestRouter } from "./api/routes/attest";
import { requestIdMiddleware, loggingMiddleware } from "./middleware/logging";

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

// Apply rate limiting to API routes
app.use("/api/v1", async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip || "unknown");
    next();
  } catch {
    res.status(429).json({ error: "Too many requests. Please try again later." });
  }
});

app.use("/api/v1", screenRouter);
app.use("/api/v1", attestRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ChainSentinel", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ChainSentinel API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});