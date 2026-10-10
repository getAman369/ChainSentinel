import { Router } from "express";
import { getLatestAttestation, getAttestationCount } from "../../services/attestationService";

export const attestRouter = Router();

attestRouter.get("/attestations/:address", async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }
    
    const [id, riskScore, evidenceHash, timestamp, valid] = await getLatestAttestation(address);
    const count = await getAttestationCount(address);
    
    return res.json({
      address,
      attestationId: id,
      riskScore,
      riskLabel: getRiskLabel(riskScore),
      evidenceHash,
      timestamp: new Date(timestamp * 1000).toISOString(),
      valid,
      totalAttestations: count,
    });
  } catch (error) {
    console.error("Attestation lookup error:", error);
    return res.status(500).json({ error: "internal server error" });
  }
});

function getRiskLabel(score: number): string {
  const labels: Record<number, string> = {
    1: "Minimal", 2: "Low", 3: "Medium", 4: "High", 5: "Critical"
  };
  return labels[score] || "Unknown";
}