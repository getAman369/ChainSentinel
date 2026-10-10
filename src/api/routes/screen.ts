import { Router } from "express";
import { ethers } from "ethers";
import { createAttestation, getLatestAttestation, getAttestationCount } from "../../services/attestationService";
import { screenAddress } from "../../services/screeningService";

export const screenRouter = Router();

screenRouter.post("/screen", async (req, res) => {
  try {
    const { address, txHash, chainId } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "invalid address format" });
    }
    
    const addressData = await screenAddress(address, chainId || 8453);
    const riskScore = predictRisk(addressData);
    const riskLabel = getRiskLabel(riskScore);
    
    const evidenceHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${address}:${txHash || "no-tx"}:${Date.now()}`)
    );
    
    const attestation = await createAttestation(address, riskScore, evidenceHash, chainId || 8453);
    
    return res.json({
      address,
      riskScore,
      riskLabel,
      confidence: "0.8500",
      evidenceHash,
      attestationTx: attestation.txHash,
      attestationId: attestation.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Screen error:", error);
    return res.status(500).json({ error: "internal server error" });
  }
});

function predictRisk(data: {
  tx_count: number;
  counterparties: number;
  avg_value: number;
  max_value: number;
  contracts: number;
  days_active: number;
  mixing_score: number;
}): number {
  let score = 1;
  if (data.tx_count > 100) score = Math.max(score, 4);
  else if (data.tx_count > 50) score = Math.max(score, 3);
  else if (data.tx_count > 20) score = Math.max(score, 2);
  
  if (data.mixing_score > 0.7) score = 5;
  else if (data.mixing_score > 0.5) score = Math.max(score, 4);
  else if (data.mixing_score > 0.3) score = Math.max(score, 3);
  
  if (data.contracts > 50) score = Math.max(score, 4);
  else if (data.contracts > 20) score = Math.max(score, 3);
  
  if (data.counterparties > 500) score = Math.max(score, 4);
  else if (data.counterparties > 100) score = Math.max(score, 3);
  
  if (data.max_value > 100) score = Math.max(score, 4);
  else if (data.max_value > 10) score = Math.max(score, 3);
  
  return score;
}

function getRiskLabel(score: number): string {
  const labels: Record<number, string> = {
    1: "Minimal", 2: "Low", 3: "Medium", 4: "High", 5: "Critical"
  };
  return labels[score] || "Unknown";
}