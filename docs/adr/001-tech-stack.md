# ADR-001: Technology Stack Selection

- **Date**: 2025-01-10
- **Status**: Accepted
- **Deciders**: ChainSentinel Engineering Team

## Context

ChainSentinel needs to screen Ethereum addresses for AML/fraud risk using ML and write immutable attestations to Base L2. The stack must support:
- Ethereum smart contract development
- Python ML model training and inference
- REST API for external clients
- On-chain transaction signing

## Decision

We selected the following technology stack:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Smart Contracts | Solidity 0.8.17 + Hardhat | Industry standard, best tooling for Base L2 |
| L1/L2 | Base Sepolia (testnet) → Base (mainnet) | Low fees, fast transactions, growing ecosystem |
| ML | Python + scikit-learn (RandomForest) | Fast training, small model size, interpretable |
| API | Node.js 20 + Express 4 | Unified JS/TS stack with ethers v6 |
| Blockchain SDK | ethers v6 | Modern, tree-shakeable, native TypeScript support |
| Rate Limiting | rate-limiter-flexible | Memory-based, works in all environments |

## Consequences

- **Positive**: Single language (TypeScript) for API, tests, and deploy scripts
- **Positive**: Python ML runs as subprocess (isolated, easy to swap models)
- **Negative**: Cross-process communication adds ~50ms latency to ML inference
- **Negative**: In-memory rate limiting doesn't scale across multiple API instances

## Alternatives Considered

1. **Embedding Python in Node** (e.g., `torchscript-node`): Higher complexity, larger bundle size
2. **Go for API**: Would require re-implementing ethers.js or using a separate service
3. **Solidity 0.8.20**: Not chosen due to compatibility with existing Base toolchain at 0.8.17
4. **Ethers v5**: V6 was released with native TypeScript support and is the current standard
