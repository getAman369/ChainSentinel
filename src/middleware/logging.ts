import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  requestId?: string;
  [key: string]: any;
}

const isDevelopment = process.env.NODE_ENV !== "production";

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, context: LogContext = {}) {
  const logEntry = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...context,
  };

  if (isDevelopment) {
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`,
      context.requestId ? `requestId=${context.requestId}` : "",
      ...Object.entries(context)
        .filter(([k]) => k !== "requestId")
        .map(([, v]) => (typeof v === "string" ? v : JSON.stringify(v)))
    );
  } else {
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](JSON.stringify(logEntry));
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
  debug: (message: string, context?: LogContext) => log("debug", message, context),
};

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers["x-request-id"] as string || randomUUID();
  (req as any).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = (req as any).requestId;

  logger.info("Request started", {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  const originalSend = res.send;
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    logger.info("Request completed", {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    });
    return originalSend.call(this, body);
  };

  next();
}
