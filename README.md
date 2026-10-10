# ChainSentinel

**ChainSentinel** is a Web API SaaS that screens crypto transactions for AML/fraud risk and writes immutable attestations to Base L2. Exchanges and DeFi protocols call the API; it returns a risk score + on-chain evidence reference.

## Product Overview

- **Domain:** Finance (AML transaction monitoring + fraud detection)
- **Form:** Web API SaaS with on-chain attestation
- **Blockchain:** Base L2, Solidity 0.8.17
- **Stack:** Python ML + Node.js/Express API
- **Budget:** Free only until first client
- **Timeline:** 8 weeks

## Risk Taxonomy

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Minimal | Low-risk address, normal activity |
| 2 | Low | Some suspicious patterns |
| 3 | Medium | Moderate risk indicators |
| 4 | High | Strong risk signals |
| 5 | Critical | Known bad actor, mixer, sanctioned |

## Architecture

```
Client (Exchange/DeFi)
    │
    ▼ POST /api/v1/screen
ChainSentinel API (Express)
    │
    ├─► screeningService (Alchemy/RPC)
    │       └─► address features (tx_count, counterparties, etc.)
    │
    ├─► ML classifier (Python/pickle)
    │       └─► riskScore (1-5) + confidence
    │
    └─► attestationService (ethers.js)
            └─► AttestationRegistry.sol on Base L2
                    └─► immutable attestation record
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- An Alchemy account (free tier)

### Setup

1. **Clone and install:**
```bash
npm install
pip install -r ml/requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your keys
```

3. **Train the ML model:**
```bash
python ml/train_model.py
```

4. **Deploy the smart contract:**
```bash
npx hardhat compile
npm run deploy
# Set BASE_SEPOLIA_REGISTRY_ADDRESS in .env
```

5. **Start the API:**
```bash
npm run dev
```

## API Endpoints

### Screen an address
```bash
POST /api/v1/screen
{
  "address": "0x...",
  "txHash": "0x...",
  "chainId": 8453
}
```

Response:
```json
{
  "address": "0x...",
  "riskScore": 3,
  "riskLabel": "Medium",
  "confidence": "0.8734",
  "evidenceHash": "0x...",
  "attestationTx": "0x...",
  "attestationId": 1,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Look up attestation
```bash
GET /api/v1/attestations/:address
```

## Smart Contract

The `AttestationRegistry.sol` contract stores:
- `riskScore` (1-5)
- `evidenceHash` (off-chain ML evidence)
- `timestamp`
- `attestor` (API operator)
- `valid` flag (revocable by owner)

## Security

- Contract: access control, pausable, evidence hash dedup
- API: rate limiting, API key auth, input validation
- ML: adversarial robustness, confidence thresholds

## Scalability

- Off-chain ML, on-chain only attestation writes
- Batch processing for historical screening
- Caching for hot addresses

## Regulatory

- GDPR: right to be forgotten (off-chain data)
- OFAC sanctions list screening
- Transparent model documentation for compliance

## MVP Success Criteria

- [ ] Working API endpoint that returns risk score
- [ ] On-chain attestation for each screen
- [ ] At least 1 beta user or letter of intent

## License

MIT