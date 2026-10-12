import { Router } from "express";
import { ethers } from "ethers";
import { spawn } from "child_process";
import path from "path";
import { createAttestation, getLatestAttestation, getAttestationCount } from "../../services/attestationService";
import { screenAddress } from "../../services/screeningService";
import { validateRequestBody, screenValidationRules } from "../../middleware/validation";

export const screenRouter = Router();

screenRouter.post("/screen", validateRequestBody(screenValidationRules), async (req, res) => {
  try {
    const { address, txHash, chainId } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "invalid address format" });
    }
    
    const addressData = await screenAddress(address, chainId || 8453);
    const riskResult = await predictRiskWithML(addressData);
    
    const evidenceHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${address}:${txHash || "no-tx"}:${Date.now()}`)
    );
    
    const attestation = await createAttestation(address, riskResult.riskScore, evidenceHash, chainId || 8453);
    
    return res.json({
      address,
      riskScore: riskResult.riskScore,
      riskLabel: riskResult.riskLabel,
      confidence: riskResult.confidence,
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

function predictRiskWithML(data: {
  tx_count: number;
  counterparties: number;
  avg_value: number;
  max_value: number;
  contracts: number;
  days_active: number;
  mixing_score: number;
}): Promise<{ riskScore: number; riskLabel: string; confidence: number }> {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [
      path.join(__dirname, "../../../ml/infer.py"),
      JSON.stringify(data),
    ]);
    
    let output = "";
    let error = "";
    
    python.stdout.on("data", (chunk) => { output += chunk; });
    python.stderr.on("data", (chunk) => { error += chunk; });
    
    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ML inference failed: ${error}`));
        return;
      }
      try {
        const result = JSON.parse(output.trim());
        if (result.error) {
          reject(new Error(result.error));
          return;
        }
        resolve(result);
      } catch {
        reject(new Error("Failed to parse ML output"));
      }
    });
  });
}