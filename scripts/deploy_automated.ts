/**
 * Automated deployment script for AttestationRegistry contract.
 * Supports deploy, verify, and upgrade-and-deploy workflows.
 *
 * Usage:
 *   npx hardhat run scripts/deploy_automated.ts --network baseSepolia
 *   npx hardhat run scripts/deploy_automated.ts --network base
 */
import hre from "hardhat";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

interface DeploymentRecord {
  network: string;
  contractAddress: string;
  deployer: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  version: string;
  abi: any[];
}

const DEPLOYMENT_FILE = path.join(__dirname, "..", "deployments.json");

function loadDeployments(): Record<string, DeploymentRecord> {
  if (fs.existsSync(DEPLOYMENT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf-8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveDeployments(deployments: Record<string, DeploymentRecord>): void {
  fs.writeFileSync(DEPLOYMENT_FILE, JSON.stringify(deployments, null, 2), "utf-8");
}

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying AttestationRegistry...");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  const provider = await deployer.provider;
  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance));

  const AttestationRegistry = await hre.ethers.getContractFactory("AttestationRegistry");
  const registry = await AttestationRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const deployTx = registry.deploymentTransaction();
  const txHash = deployTx?.hash || "";
  const receipt = deployTx ? await provider.getTransactionReceipt(txHash) : null;
  const blockNumber = receipt ? Number(receipt.blockNumber) : 0;

  console.log(`AttestationRegistry deployed to: ${address}`);
  console.log(`Transaction hash: ${txHash}`);
  console.log(`Block number: ${blockNumber}`);

  const version = await registry.getVersion();
  console.log(`Contract version: ${version}`);

  const artifact = await hre.artifacts.readArtifact("AttestationRegistry");

  const deployments = loadDeployments();
  deployments[network] = {
    network,
    contractAddress: address,
    deployer: deployer.address,
    txHash,
    blockNumber,
    timestamp: new Date().toISOString(),
    version: version as string,
    abi: artifact.abi,
  };
  saveDeployments(deployments);

  console.log(`\nDeployment record saved to ${DEPLOYMENT_FILE}`);

  if (hre.network.name !== "hardhat" && txHash) {
    const explorerUrl = getExplorerUrl(network, txHash);
    if (explorerUrl) {
      console.log(`Verify on explorer: ${explorerUrl}`);
    }
  }
}

function getExplorerUrl(network: string, txHash: string): string | null {
  const explorers: Record<string, string> = {
    baseSepolia: `https://sepolia.basescan.org/tx/${txHash}`,
    base: `https://basescan.org/tx/${txHash}`,
  };
  return explorers[network] || null;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
