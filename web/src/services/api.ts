import type {
  ApiVersionInfo,
  Attestation,
  HealthCheck,
  ScreenRequest,
  ScreenResponse,
} from "@/types";
import {
  apiVersionInfoSchema,
  attestationSchema,
  healthCheckSchema,
  screenResponseSchema,
} from "@/types";

import { get, post } from "./client";

export async function screenAddress(request: ScreenRequest): Promise<ScreenResponse> {
  const data = await post<unknown>("/screen", request);
  return screenResponseSchema.parse(data) as ScreenResponse;
}

export async function getAttestation(address: string): Promise<Attestation> {
  const data = await get<unknown>(`/attestations/${encodeURIComponent(address)}`);
  return attestationSchema.parse(data) as Attestation;
}

export async function getHealth(): Promise<HealthCheck> {
  const data = await get<unknown>("/health", { baseUrl: "" });
  return healthCheckSchema.parse(data) as HealthCheck;
}

export async function getApiInfo(): Promise<ApiVersionInfo> {
  const data = await get<unknown>("/", { baseUrl: "" });
  return apiVersionInfoSchema.parse(data) as ApiVersionInfo;
}
