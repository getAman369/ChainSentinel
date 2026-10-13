import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { screenRouter } from "./api/routes/screen";
import { attestRouter } from "./api/routes/attest";
import { healthRouter } from "./api/routes/health";
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

const MAX_REQUEST_SIZE = process.env.MAX_REQUEST_SIZE || "1mb";
const MAX_RESPONSE_SIZE = process.env.MAX_RESPONSE_SIZE || "1mb";

const parseSize = (size: string): number => {
  const num = parseInt(size, 10);
  if (isNaN(num)) return 1024 * 1024;
  const unit = size.replace(/[0-9]/g, "").toLowerCase().trim();
  if (unit === "mb") return num * 1024 * 1024;
  if (unit === "kb") return num * 1024;
  if (unit === "gb") return num * 1024 * 1024 * 1024;
  return num;
};

const maxResponseBytes = parseSize(MAX_RESPONSE_SIZE);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    frameguard: { action: "deny" },
    xssFilter: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
app.use(cors());
app.use(express.json({ limit: MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ limit: MAX_REQUEST_SIZE, extended: true }));

app.use((req, res, next) => {
  if (req.headers["content-length"]) {
    const size = parseInt(req.headers["content-length"], 10);
    if (size > parseSize(MAX_REQUEST_SIZE)) {
      return next(new Error("Request payload too large"));
    }
  }
  next();
});

app.use(requestIdMiddleware);
app.use(loggingMiddleware);

const responseSizeLimiter = (req: any, res: any, next: any) => {
  const originalWrite = res.write;
  const originalEnd = res.end;
  let bytesWritten = 0;

  res.write = function (chunk: any) {
    bytesWritten += chunk ? Buffer.byteLength(chunk) : 0;
    if (bytesWritten > maxResponseBytes) {
      res.status(413);
    }
    return originalWrite.apply(res, arguments as any);
  };

  res.end = function (chunk: any) {
    bytesWritten += chunk ? Buffer.byteLength(chunk) : 0;
    if (bytesWritten > maxResponseBytes) {
      return originalEnd.call(res, JSON.stringify({ error: "Response too large" }), "utf-8");
    }
    return originalEnd.apply(res, arguments as any);
  };

  next();
};
app.use(responseSizeLimiter);

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
      docs: "GET /api/v1/docs",
    },
    timestamp: new Date().toISOString(),
  });
});

app.get(`/api/${API_VERSION}/docs`, (_req, res) => {
  const specPath = path.join(__dirname, "..", "..", "docs", "openapi.json");
  res.sendFile(specPath);
});

app.use("/health", healthRouter);

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ChainSentinel API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/${API_VERSION}`);
});