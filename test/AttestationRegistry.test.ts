import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers } from "ethers";
import hre from "hardhat";

describe("AttestationRegistry", function () {
  async function deployRegistryFixture() {
    const [owner, otherAccount, subjectAccount] = await hre.ethers.getSigners();
    const Registry = await hre.ethers.getContractFactory("AttestationRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    return { registry, owner, otherAccount, subjectAccount };
  }

  it("Should deploy with owner set", async function () {
    const { registry, owner } = await loadFixture(deployRegistryFixture);
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("Should create an attestation", async function () {
    const { registry, subjectAccount } = await loadFixture(deployRegistryFixture);
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence-1"));
    
    await registry.createAttestation(subjectAccount.address, 3, evidenceHash);
    
    const count = await registry.getAttestationCount(subjectAccount.address);
    expect(count).to.equal(1);
    
    const [id, riskScore, hash, timestamp, valid] = await registry.getLatestAttestation(subjectAccount.address);
    expect(id).to.equal(1);
    expect(riskScore).to.equal(3);
    expect(hash).to.equal(evidenceHash);
    expect(valid).to.equal(true);
  });

  it("Should reject invalid risk scores", async function () {
    const { registry, subjectAccount } = await loadFixture(deployRegistryFixture);
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence-2"));
    
    await expect(registry.createAttestation(subjectAccount.address, 0, evidenceHash)).to.be.revertedWith("Invalid risk score");
    await expect(registry.createAttestation(subjectAccount.address, 6, evidenceHash)).to.be.revertedWith("Invalid risk score");
  });

  it("Should reject duplicate evidence hashes", async function () {
    const { registry, subjectAccount } = await loadFixture(deployRegistryFixture);
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence-3"));
    
    await registry.createAttestation(subjectAccount.address, 2, evidenceHash);
    await expect(registry.createAttestation(subjectAccount.address, 4, evidenceHash)).to.be.revertedWith("Evidence hash already used");
  });

  it("Should allow owner to revoke attestation", async function () {
    const { registry, subjectAccount } = await loadFixture(deployRegistryFixture);
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence-4"));
    
    await registry.createAttestation(subjectAccount.address, 4, evidenceHash);
    await (registry as any).revokeAttestation(1);
    
    const [, , , , valid] = await registry.getLatestAttestation(subjectAccount.address);
    expect(valid).to.equal(false);
  });

  it("Should not allow non-owner to revoke", async function () {
    const { registry, otherAccount, subjectAccount } = await loadFixture(deployRegistryFixture);
    const connected = registry.connect(otherAccount);
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence-5"));
    
    await registry.createAttestation(subjectAccount.address, 5, evidenceHash);
    await expect((connected as any).revokeAttestation(1)).to.be.revertedWith("Only owner can call this.");
  });

  it("Should track multiple attestations per subject", async function () {
    const { registry, subjectAccount } = await loadFixture(deployRegistryFixture);
    const evidenceHash1 = ethers.keccak256(ethers.toUtf8Bytes("evidence-6a"));
    const evidenceHash2 = ethers.keccak256(ethers.toUtf8Bytes("evidence-6b"));
    
    await registry.createAttestation(subjectAccount.address, 2, evidenceHash1);
    await registry.createAttestation(subjectAccount.address, 5, evidenceHash2);
    
    const count = await registry.getAttestationCount(subjectAccount.address);
    expect(count).to.equal(2);
    
    const [id, riskScore, , , valid] = await registry.getLatestAttestation(subjectAccount.address);
    expect(id).to.equal(2);
    expect(riskScore).to.equal(5);
    expect(valid).to.equal(true);
  });
});