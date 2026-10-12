# ADR-002: On-Chain Attestation vs Full On-Chain ML

- **Date**: 2025-01-10
- **Status**: Accepted
- **Deciders**: ChainSentinel Engineering Team

## Context

AML risk scoring requires ML models that are too expensive to run on-chain (gas costs). However, the attestation (risk score + evidence reference) should be immutable and verifiable by clients.

## Decision

**Hybrid approach**: Run ML off-chain, store only the attestation on-chain.

### On-Chain Data (AttestationRegistry.sol)
- `riskScore` (uint8, 1-5)
- `evidenceHash` (bytes32) — keccak256 hash of off-chain ML evidence payload
- `timestamp` (uint256)
- `attestor` (address) — who created the attestation
- `valid` (bool) — revocable flag

### Off-Chain Data (ML Service)
- Full feature vector (tx_count, counterparties, avg_value, etc.)
- Per-class probabilities
- Model version
- Feature importance snapshot

## Rationale

1. **Gas efficiency**: Storing 7 integers + 1 hash ≈ 200k gas vs. full model inference ≈ 10M+ gas
2. **Verifiability**: Clients can verify the on-chain attestation against their own investigation
3. **Upgradability**: ML model can be updated without contract migration
4. **Privacy**: Detailed transaction patterns stay off-chain (GDPR compliant by design)

## Consequences

- **Positive**: Low transaction costs (~$0.01 per attestation on Base)
- **Positive**: Model can be retrained independently of contract
- **Negative**: Evidence is not fully on-chain; clients must trust the evidence hash
- **Negative**: Requires off-chain data availability for audit/reconciliation

## Evidence Reference

The `evidenceHash` is computed as:
```
keccak256(abi.encode(subject, txHash, timestamp))
```

This allows the API operator to produce a Merkle proof or detailed evidence JSON
that hashes to this value, enabling selective disclosure.
