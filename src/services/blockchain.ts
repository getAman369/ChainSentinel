import { ethers } from "ethers";

const providers: Map<number, ethers.Provider> = new Map();
let signer: ethers.Wallet | null = null;

export function getProvider(chainId: number = 8453): ethers.Provider {
  if (providers.has(chainId)) {
    return providers.get(chainId)!;
  }
  
  const rpcUrl = chainId === 84531 
    ? process.env.BASE_SEPOLIA_URL 
    : process.env.BASE_URL;
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  providers.set(chainId, provider);
  return provider;
}

export function getSigner(): ethers.Wallet {
  if (signer) return signer;
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in environment");
  }
  
  const provider = getProvider(84531);
  signer = new ethers.Wallet(privateKey, provider);
  return signer;
}