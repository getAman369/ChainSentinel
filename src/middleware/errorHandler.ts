import { Request, Response, NextFunction } from "express";
import { logger } from "./logging";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public requestId?: string;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = (req as any).requestId;

  if (err instanceof AppError) {
    logger.error("Application error", {
      requestId,
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      stack: err.stack,
    });

    return res.status(err.statusCode).json({
      error: err.message,
      requestId,
    });
  }

  logger.error("Unexpected error", {
    requestId,
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    error: "Internal server error",
    requestId,
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  const requestId = (req as any).requestId;
  logger.warn("Route not found", {
    requestId,
    method: req.method,
    path: req.path,
  });

  res.status(404).json({
    error: "Resource not found",
    path: req.path,
    method: req.method,
    requestId,
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
