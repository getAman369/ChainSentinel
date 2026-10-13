# ChainSentinel

**ChainSentinel** is a Web API SaaS that screens crypto transactions for AML/fraud risk and writes immutable attestations to Base L2. Exchanges and DeFi protocols call the API; it returns a risk score + on-chain evidence reference.

## Product Overview

- **Domain:** Finance (AML transaction monitoring + fraud detection)
- **Form:** Web API SaaS with on-chain attestation
- **Blockchain:** Base L2, Solidity 0.8.17
- **Stack:** React 18 + Vite frontend, Node.js/Express API, Python ML
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
Browser (React 18 + Vite, web/)
    │
    ▼ /api/v1/* (Vite proxy in dev, same-origin in prod)
ChainSentinel API (Express)
    │
    ├─► screeningService (Base RPC)
    │       └─► address features (tx_count, counterparties, etc.)
    │
    ├─► ML classifier (Python/pickle, ml/infer.py)
    │       └─► riskScore (1-5) + confidence
    │
    └─► attestationService (ethers.js)
            └─► AttestationRegistry.sol on Base L2
                    └─► immutable attestation record
```

## Project Structure

```
├── contracts/          # Solidity AttestationRegistry
├── ml/                 # Python ML training + inference
├── public/             # Legacy vanilla JS frontend (fallback)
├── scripts/            # Hardhat deployment scripts
├── src/                # Express API server
│   └── api/routes/     # screen, attest, health
├── test/               # Hardhat contract tests
└── web/                # React 18 + Vite + TypeScript frontend
    └── src/
        ├── components/ # UI, forms, display, feedback, layout
        ├── hooks/      # useApi, useTheme, useScreenAddress
        ├── pages/      # Home, History, Results, Docs, Settings, About
        ├── services/   # Typed API client (zod-validated)
        └── types/      # API response types + zod schemas
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Base RPC endpoint (Alchemy/QuickNode free tier)

### Setup

1. **Clone and install:**
```bash
npm install
pip install -r ml/requirements.txt
cd web && npm install && cd ..
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

## Development

### Frontend (React + Vite)
The React app lives in `web/`. During development it runs on
`localhost:5173` and proxies `/api/*` and `/health` to the Express
server on `localhost:3000`.

```bash
cd web
npm run dev        # Vite dev server with HMR
npm run build      # typecheck + production build to web/dist
npm test           # Vitest + React Testing Library
npm run lint       # ESLint + Prettier
```

### Production
Build the frontend (`npm run web:build`), then start the API. The
Express server serves `web/dist/` automatically when it exists, with
an SPA fallback for client-side routes. The legacy `public/` app is
served as a fallback when no React build is present.

### Local blockchain testing
```bash
npx hardhat node                                  # localhost:8545
npx hardhat run scripts/deploy.ts --network localhost
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

### Health check
```bash
GET /health
```

Returns overall status plus per-dependency checks (blockchain
provider, ML model, smart contract, wallet).

## Smart Contract

The `AttestationRegistry.sol` contract stores:
- `riskScore` (1-5)
- `evidenceHash` (off-chain ML evidence)
- `timestamp`
- `attestor` (API operator)
- `valid` flag (revocable by owner)

## Testing

```bash
npm test              # Hardhat contract tests
npm run web:test      # Vitest frontend tests (31 tests)
python ml/train_model.py   # ML training + evaluation
```

## Deployment

The multi-stage `Dockerfile` builds the React app
(`web-builder` stage), compiles the API (`builder` stage), and
installs Python ML dependencies (`ml-base` stage). The runtime
image serves the API and the built frontend on port 3000.

```bash
docker build -t chainsentinel:latest .
docker run -p 3000:3000 --env-file .env chainsentinel:latest
```

## Security

- Contract: access control, evidence hash dedup
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

- [x] Working API endpoint that returns risk score
- [x] On-chain attestation for each screen
- [ ] At least 1 beta user or letter of intent

## License

MIT