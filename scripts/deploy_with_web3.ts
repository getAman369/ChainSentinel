// Legacy Remix scripts - kept for reference, not used by ChainSentinel
// These reference Remix IDE globals (web3Provider, remix) that don't exist outside Remix
import { deploy } from "./web3-lib";

(async () => {
  try {
    const result = await deploy("Storage", []);
    console.log(`address: ${result.address}`);
  } catch (e) {
    console.log((e as Error).message);
  }
})();