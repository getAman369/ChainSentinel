export type RiskLevel = "minimal" | "low" | "medium" | "high" | "critical";

export const RISK_LEVELS: Record<number, { level: RiskLevel; label: string }> = {
  1: { level: "minimal", label: "Minimal" },
  2: { level: "low", label: "Low" },
  3: { level: "medium", label: "Medium" },
  4: { level: "high", label: "High" },
  5: { level: "critical", label: "Critical" },
};

export function riskLevelFromScore(score: number): {
  level: RiskLevel;
  label: string;
} {
  return RISK_LEVELS[score] ?? { level: "medium", label: "Unknown" };
}

export interface NetworkOption {
  chainId: number;
  name: string;
  isTestnet: boolean;
}

export const NETWORKS: readonly NetworkOption[] = [
  { chainId: 8453, name: "Base Mainnet", isTestnet: false },
  { chainId: 84531, name: "Base Sepolia", isTestnet: true },
];

export const MAX_ADDRESS_HISTORY = 10;
export const ADDRESS_HISTORY_KEY = "addressHistory";
export const THEME_STORAGE_KEY = "chainsentinel-theme";
export const BASE_SCAN_URL = "https://sepolia.basescan.org";
export const BASE_MAINNET_SCAN_URL = "https://basescan.org";
