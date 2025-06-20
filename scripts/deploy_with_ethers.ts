const hre = require("hardhat");

async function main() {
  const OpenDAOHub = await hre.ethers.getContractFactory("OpenDAOHub");
  const contract = await OpenDAOHub.deploy("Initial DAO Proposal");

  await contract.deployed();

  console.log(`OpenDAOHub deployed to: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});