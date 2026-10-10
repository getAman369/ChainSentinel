import hre from "hardhat";

async function main() {
  const AttestationRegistry = await hre.ethers.getContractFactory("AttestationRegistry");
  const registry = await AttestationRegistry.deploy();
  await registry.waitForDeployment();
  console.log(`AttestationRegistry deployed to: ${await registry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});