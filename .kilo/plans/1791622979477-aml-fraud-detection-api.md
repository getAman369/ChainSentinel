# ChainSentinel — 8-Week MVP Plan

## Product Concept
A Web API SaaS that screens crypto transactions for AML/fraud risk and writes immutable attestations to Base L2. Exchanges and DeFi protocols call the API; it returns a risk score + on-chain evidence reference.

## Confirmed Decisions
- Domain: Finance (AML transaction monitoring + fraud detection)
- Form: Web API SaaS with on-chain attestation
- Blockchain: Base L2, Solidity 0.8.17
- Stack: Python ML + Node.js/Express API, Alchemy free tier, public labeled datasets
- Budget: Free only until first client
- Timeline: 8 weeks

## Week 1: Problem Validation + Data + Foundation
- Validate problem: interview 3-5 potential buyers (exchange ops, DeFi devs)
- Set up repo structure
- Alchemy free account + Base Sepolia RPC
- Collect training data: scrape public labeled datasets (Elliptic, Etherscan labels)
- Define risk taxonomy: 5 levels (Minimal, Low, Medium, High, Critical)

## Week 2: MVP Model + Smart Contract
- Train baseline ML classifier (logistic regression / random forest)
- Write AttestationRegistry.sol: stores riskScore, evidenceHash, timestamp, chainId
- Compile + deploy to Base Sepolia
- Unit tests with Hardhat/Foundry

## Week 3: API Backend + Integration
- Node.js/Express API: POST /screen (address, txHash) -> riskScore
- ML inference pipeline: address -> features -> model -> score
- Write attestation to contract after scoring
- Return report + tx reference to client

## Week 4: Frontend Dashboard (minimal)
- Web UI showing screen results, attestation explorer
- Simple auth (API key per client)

## Week 5: Hardening + Testing
- Rate limiting, caching (Redis free tier)
- Integration tests
- Security review of contract + API

## Week 6: Deployment + Monitoring
- Deploy to production (Railway/Render free tiers)
- Basic monitoring + alerting
- Create demo video + README

## Week 7: Sales + Outreach
- Outreach to potential buyers
- Refine pitch based on feedback

## Week 8: Iterate + Polish
- Fix issues from beta
- Prepare pricing page
- Finalize MVP

## Toolchains
- Blockchain: Foundry or Hardhat, Solidity 0.8.17, Base Sepolia/Mainnet
- ML: Python, scikit-learn/PyTorch, pandas
- API: Node.js/Express or Python/FastAPI
- Data: Alchemy free tier, public labeled datasets
- DB: PostgreSQL (Supabase free) + Redis (Upstash free)
- Hosting: Railway/Render (free tiers)

## Security Considerations
- Contract: access control, pausable, upgradeability pattern
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
- Working API endpoint that returns risk score
- On-chain attestation for each screen
- At least 1 beta user or letter of intent