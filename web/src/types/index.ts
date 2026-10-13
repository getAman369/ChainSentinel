import { z } from "zod";

export interface ScreenRequest {
  address: string;
  txHash?: string | null;
  chainId?: number;
  confidence_threshold?: number;
}

export interface ScreenResponse {
  address: string;
  riskScore: number;
  riskLabel: string;
  confidence: number;
  evidenceHash: string;
  attestationTx: string;
  attestationId: number;
  timestamp: string;
}

export interface Attestation {
  address: string;
  attestationId: number;
  riskScore: number;
  riskLabel: string;
  evidenceHash: string;
  timestamp: string;
  valid: boolean;
  totalAttestations: number;
}

export interface DependencyCheck {
  status: string;
  message?: string;
  blockNumber?: number;
  size?: number;
  address?: string;
}

export interface HealthCheck {
  status: "ok" | "degraded";
  service: string;
  timestamp: string;
  uptime: number;
  dependencies: Record<string, DependencyCheck>;
}

export interface ApiVersionInfo {
  service: string;
  version: string;
  endpoints: {
    screen: string;
    attestations: string;
    health: string;
    docs: string;
  };
  timestamp: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}

export const screenResponseSchema = z.object({
  address: z.string(),
  riskScore: z.number().int().min(1).max(5),
  riskLabel: z.string(),
  confidence: z.number().min(0).max(1),
  evidenceHash: z.string(),
  attestationTx: z.string(),
  attestationId: z.number(),
  timestamp: z.string(),
});

export const attestationSchema = z.object({
  address: z.string(),
  attestationId: z.number(),
  riskScore: z.number().int().min(1).max(5),
  riskLabel: z.string(),
  evidenceHash: z.string(),
  timestamp: z.string(),
  valid: z.boolean(),
  totalAttestations: z.number(),
});

export const healthCheckSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  service: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  dependencies: z.record(z.string(), z.unknown()),
});

export const apiVersionInfoSchema = z.object({
  service: z.string(),
  version: z.string(),
  endpoints: z.object({
    screen: z.string(),
    attestations: z.string(),
    health: z.string(),
    docs: z.string(),
  }),
  timestamp: z.string(),
});
