import { useCallback } from "react";

import { ApiClientError } from "@/services/client";
import { screenAddress } from "@/services/api";
import type { ScreenRequest, ScreenResponse } from "@/types";

import { useToast } from "@components/feedback/Toast";

function generateMockHash(seed: string, length: number): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let result = "";
  let current = hash;
  while (result.length < length) {
    current = (current * 1103515245 + 12345) >>> 0;
    result += current.toString(16).padStart(8, "0");
  }
  return `0x${result.slice(0, length)}`;
}

export function mockScreenResponse(request: ScreenRequest): ScreenResponse {
  const seed = `${request.address}:${request.txHash ?? "no-tx"}`;
  const hash = generateMockHash(seed, 64);
  const numeric = parseInt(hash.slice(2, 4), 16);
  const riskScore = (numeric % 5) + 1;
  const labels: Record<number, string> = {
    1: "Minimal",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Critical",
  };
  const confidence = 0.7 + (numeric % 25) / 100;

  return {
    address: request.address,
    riskScore,
    riskLabel: labels[riskScore],
    confidence,
    evidenceHash: generateMockHash(`evidence:${seed}`, 64),
    attestationTx: generateMockHash(`tx:${seed}`, 64),
    attestationId: numeric,
    timestamp: new Date().toISOString(),
  };
}

export function useScreenAddress() {
  const { push } = useToast();

  const screen = useCallback(
    async (request: ScreenRequest): Promise<ScreenResponse> => {
      try {
        return await screenAddress(request);
      } catch (error) {
        if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
          throw error;
        }
        push("warning", "API unavailable — showing sample data", 4000);
        return mockScreenResponse(request);
      }
    },
    [push],
  );

  return { screen };
}
