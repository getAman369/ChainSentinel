import { Router, Request, Response } from "express";
import { getProvider } from "../../services/blockchain";
import fs from "fs";
import path from "path";

export const healthRouter = Router();

healthRouter.get("/", async (req: Request, res: Response) => {
  const checks: Record<string, { status: string; message?: string }> = {};

  // Check blockchain provider
  try {
    const provider = getProvider(8453);
    const block = await provider.getBlock("latest");
    checks.blockchain = {
      status: block ? "ok" : "unavailable",
      ...(block ? { blockNumber: Number(block.number) } : { message: "Could not retrieve latest block" }),
    };
  } catch (error: any) {
    checks.blockchain = {
      status: "error",
      message: error.message || "Blockchain provider unreachable",
    };
  }

  // Check ML model
  const modelPath = path.join(process.cwd(), "ml", "models", "risk_model.pkl");
  checks.ml_model = {
    status: fs.existsSync(modelPath) ? "ok" : "missing",
    ...(fs.existsSync(modelPath)
      ? { size: fs.statSync(modelPath).size }
      : { message: `Model not found at ${modelPath}` }),
  };

  // Check smart contract
  const registryAddress = process.env.BASE_SEPOLIA_REGISTRY_ADDRESS || process.env.BASE_REGISTRY_ADDRESS;
  checks.smart_contract = {
    status: registryAddress ? "configured" : "unconfigured",
    ...(registryAddress ? { address: registryAddress } : { message: "Set BASE_SEPOLIA_REGISTRY_ADDRESS in .env" }),
  };

  // Check private key
  checks.wallet = {
    status: process.env.PRIVATE_KEY ? "configured" : "unconfigured",
  };

  // Overall status
  const allOk = Object.values(checks).every(
    (c) => c.status === "ok" || c.status === "configured"
  );

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    service: "ChainSentinel",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: checks,
  });
});
