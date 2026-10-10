// Legacy Remix web3 library - kept for reference
// These reference Remix IDE globals (web3Provider, remix) that don't exist outside Remix
export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<any> => {
  console.log(`deploying ${contractName}`);
  // Requires Remix IDE environment - not usable standalone
  throw new Error("This function requires Remix IDE environment");
};