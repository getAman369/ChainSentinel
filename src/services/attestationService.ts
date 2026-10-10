import { ethers } from "ethers";
import { getProvider, getSigner } from "./blockchain";

const REGISTRY_ABI = [
  "function createAttestation(address subject, uint8 riskScore, bytes32 evidenceHash) external",
  "function getLatestAttestation(address subject) external view returns (uint256 id, uint8 riskScore, bytes32 evidenceHash, uint256 timestamp, bool valid)",
  "function getAttestationCount(address subject) external view returns (uint256)",
];

export interface AttestationResult {
  id: number;
  txHash: string;
  riskScore: number;
  evidenceHash: string;
  timestamp: number;
}

export async function createAttestation(
  subject: string,
  riskScore: number,
  evidenceHash: string,
  chainId: number = 8453
): Promise<AttestationResult> {
  const signer = getSigner();
  const registry = new ethers.Contract(
    getRegistryAddress(chainId),
    REGISTRY_ABI,
    signer
  );
  
  const tx = await registry.createAttestation(subject, riskScore, evidenceHash);
  const receipt = await tx.wait();
  
  let attestationId = 0;
  if (receipt) {
    for (const log of receipt.logs) {
      try {
        const parsed = registry.interface.parseLog(log);
        if (parsed && parsed.name === "AttestationCreated") {
          attestationId = Number(parsed.args.id);
        }
      } catch {}
    }
  }
  
  return {
    id: attestationId,
    txHash: receipt?.hash || tx.hash,
    riskScore,
    evidenceHash,
    timestamp: receipt ? Number(receipt.blockTimestamp) : Math.floor(Date.now() / 1000),
  };
}

export async function getLatestAttestation(
  subject: string,
  chainId: number = 8453
): Promise<[number, number, string, number, boolean]> {
  const provider = getProvider(chainId);
  const registry = new ethers.Contract(
    getRegistryAddress(chainId),
    REGISTRY_ABI,
    provider
  );
  
  const result = await registry.getLatestAttestation(subject);
  return [
    Number(result[0]),
    Number(result[1]),
    result[2],
    Number(result[3]),
    result[4],
  ];
}

export async function getAttestationCount(
  subject: string,
  chainId: number = 8453
): Promise<number> {
  const provider = getProvider(chainId);
  const registry = new ethers.Contract(
    getRegistryAddress(chainId),
    REGISTRY_ABI,
    provider
  );
  
  const count = await registry.getAttestationCount(subject);
  return Number(count);
}

function getRegistryAddress(chainId: number): string {
  const addresses: Record<number, string> = {
    8453: process.env.BASE_REGISTRY_ADDRESS || "",
    84531: process.env.BASE_SEPOLIA_REGISTRY_ADDRESS || "",
  };
  return addresses[chainId] || "";
}