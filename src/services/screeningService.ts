import { ethers } from "ethers";

export interface AddressData {
  tx_count: number;
  counterparties: number;
  avg_value: number;
  max_value: number;
  contracts: number;
  days_active: number;
  mixing_score: number;
}

export async function screenAddress(
  address: string,
  chainId: number = 8453
): Promise<AddressData> {
  const rpcUrl = chainId === 84531
    ? process.env.BASE_SEPOLIA_URL
    : process.env.BASE_URL;
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const txCount = Number(await provider.getTransactionCount(address));
  const balance = await provider.getBalance(address);
  const code = await provider.getCode(address);
  const isContract = code !== "0x";
  
  const block = await provider.getBlock("latest");
  const currentBlock = Number(block?.number || 0);
  
  // Estimate days active from transaction count (simplified for MVP)
  const daysActive = Math.max(1, Math.floor(txCount / 10));
  
  // Estimate counterparties from transaction count
  const counterparties = Math.min(txCount, Math.floor(txCount * 0.7));
  
  const mixingScore = isContract ? 0.7 : Math.min(1.0, txCount / 500);
  
  const ethBalance = Number(ethers.formatEther(balance));
  const avgValue = txCount > 0 ? ethBalance / txCount : 0;
  const maxValue = ethBalance;
  
  return {
    tx_count: txCount,
    counterparties,
    avg_value: avgValue,
    max_value: maxValue,
    contracts: isContract ? 1 : 0,
    days_active: daysActive,
    mixing_score: mixingScore,
  };
}