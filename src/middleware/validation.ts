import { Request, Response, NextFunction } from "express";
import { ethers } from "ethers";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "object";
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean;
  errorMessage?: string;
}

export function validateRequestBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(rule.errorMessage || `${rule.field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rule.type && typeof value !== rule.type) {
          errors.push(rule.errorMessage || `${rule.field} must be of type ${rule.type}`);
          continue;
        }

        if (rule.pattern && typeof value === "string") {
          if (!rule.pattern.test(value)) {
            errors.push(rule.errorMessage || `${rule.field} has invalid format`);
            continue;
          }
        }

        if (rule.type === "number" && typeof value === "number") {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(rule.errorMessage || `${rule.field} must be >= ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(rule.errorMessage || `${rule.field} must be <= ${rule.max}`);
          }
        }

        if (rule.custom && !rule.custom(value)) {
          errors.push(rule.errorMessage || `${rule.field} validation failed`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
}

export const ethereumAddressRule: ValidationRule = {
  field: "address",
  required: true,
  type: "string",
  pattern: /^0x[a-fA-F0-9]{40}$/,
  errorMessage: "address must be a valid Ethereum address (0x + 40 hex characters)",
  custom: (value) => ethers.isAddress(value),
};

export const screenValidationRules: ValidationRule[] = [
  ethereumAddressRule,
  {
    field: "txHash",
    required: false,
    type: "string",
    pattern: /^0x[a-fA-F0-9]{64}$/,
    errorMessage: "txHash must be a valid transaction hash (0x + 64 hex characters)",
  },
  {
    field: "chainId",
    required: false,
    type: "number",
    min: 1,
    max: 999999999,
    errorMessage: "chainId must be a positive integer",
  },
];

export function validateAddressParam(req: Request, res: Response, next: NextFunction) {
  const { address } = req.params;

  if (!address) {
    return res.status(400).json({ error: "address parameter is required" });
  }

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "invalid address format" });
  }

  next();
}
