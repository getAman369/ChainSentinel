# Backup and Recovery Procedures

## Overview

This document outlines the backup and recovery procedures for ChainSentinel components: the API service, ML models, on-chain attestations, and configuration.

---

## 1. API Configuration Backup

### What to Back Up
- `.env` file (environment configuration)
- `.env.example` (template)
- `package.json` and `package-lock.json` (dependencies)
- `tsconfig.json` (TypeScript config)
- `hardhat.config.ts` (deployment config)

### Backup Schedule
- **Daily**: `.env` and all configuration files
- **On every deployment**: Full application state

### Backup Command
```bash
# Daily config backup
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env .env.example package.json tsconfig.json hardhat.config.ts

# Verify backup integrity
tar -tzf config-backup-$(date +%Y%m%d).tar.gz
```

### Storage
- Local encrypted volume (daily)
- Encrypted S3 bucket (remote offsite)
- Access: restricted to DevOps team only

---

## 2. ML Model Backup

### What to Back Up
- `ml/models/risk_model.pkl` (pickled RandomForest model)
- `ml/models/metrics.json` (evaluation metrics history)
- `ml/models/versions.json` (version metadata)
- `ml/models/feature_importance.json` (feature analysis)

### Backup Schedule
- **After every retraining**: Complete model snapshot
- **Weekly**: Full model directory backup

### Backup Command
```bash
# Post-training backup
MODEL_VERSION=$(python3 -c "from ml.model_versioning import MODEL_VERSION; print(MODEL_VERSION)")
tar -czf model-backup-v${MODEL_VERSION}-$(date +%Y%m%d).tar.gz ml/models/

# Verify model integrity
python3 ml/model_versioning.py  # Verify hash matches
```

### Recovery
```bash
# Restore model from backup
tar -xzf model-backup-v1.1.0.tar.gz
# Verify the model loads
python3 ml/infer.py '{"tx_count": 100, "counterparties": 50, "avg_value": 10.5, "max_value": 100.0, "contracts": 10, "days_active": 365, "mixing_score": 0.4}'
```

---

## 3. Deployment Records Backup

### What to Back Up
- `deployments.json` (contract address and deployment metadata)

### Recovery
```bash
# Restore deployment records
cp backups/deployments.json ./
# Verify contract address is correct
cat deployments.json | jq '.baseSepolia.contractAddress'
```

---

## 4. Blockchain (On-Chain) Backup

### Strategy
The AttestationRegistry smart contract is deployed on Base L2. On-chain data does not require traditional backup — it is immutable and verifiable.

### Recovery Options
- **Contract replay**: Use `deployments.json` to reconnect to existing contract
- **Event log replay**: Query past `AttestationCreated` events for full history
- **State export**: Optional off-chain export of attestation data

```solidity
// Query all attestations for a subject
function getAttestationsBySubject(
    address subject,
    uint256 offset,
    uint256 limit
) external view returns (...);

// Get total count for pagination
function getAttestationCount(address subject) external view returns (uint256);
```

---

## 5. Database (If Enabled)

### What to Back Up
- `DATABASE_URL` connection string in `.env`
- All database data (screening logs, user preferences, API keys)

### Backup Command (PostgreSQL example)
```bash
# Daily database dump
pg_dump -h $DB_HOST -U $DB_USER -F c chainsentinel > db-backup-$(date +%Y%m%d).dump

# Automated backup with cron
0 2 * * * pg_dump -h $DB_HOST -U $DB_USER chainsentinel | gzip > /backups/db-$(date +%Y%m%d).sql.gz
```

### Recovery
```bash
# Restore database
pg_restore -h $DB_HOST -U $DB_USER -d chainsentinel db-backup-20250101.dump
```

---

## 6. Disaster Recovery Plan

### Scenario 1: API Service Failure
1. Restore latest Docker image or rebuild from source
2. Restore `.env` configuration
3. Ensure `ml/models/risk_model.pkl` is present
4. Restart with `docker-compose up -d`
5. Verify with `curl http://localhost:3000/health`

### Scenario 2: ML Model Corruption
1. Identify latest valid model from `versions.json`
2. Restore from model backup
3. Verify with `python3 ml/infer.py` test
4. Restart API service

### Scenario 3: Private Key Compromise
1. Immediately rotate `PRIVATE_KEY` in `.env`
2. Transfer any remaining funds to new wallet
3. Deploy new AttestationRegistry contract (use `scripts/deploy_automated.ts`)
4. Update `BASE_SEPOLIA_REGISTRY_ADDRESS` and `BASE_REGISTRY_ADDRESS`
5. Notify dependent services to update contract address

### Scenario 4: Configuration Loss
1. Restore `.env` from most recent backup
2. Verify environment variables match deployment
3. Test API startup and blockchain connectivity
4. Run health check

---

## 7. Recovery Time Objectives (RTO)

| Component | RTO | RPO |
|-----------|-----|-----|
| API Service | 15 min | 5 min |
| ML Model | 30 min | 24 hours |
| Smart Contract | 0 min | 0 min |
| Database | 4 hours | 24 hours |
| Configuration | 10 min | 24 hours |

---

## 8. Backup Verification

Run monthly verification tests:

```bash
# 1. Verify config backup
tar -tzf config-backup-* > /dev/null 2>&1 && echo "Config backup OK" || echo "Config backup FAILED"

# 2. Verify model backup
python3 ml/infer.py '{"tx_count": 100, "counterparties": 50, "avg_value": 10.5, "max_value": 100.0, "contracts": 10, "days_active": 365, "mixing_score": 0.4}' > /dev/null && echo "Model OK" || echo "Model FAILED"

# 3. Verify TypeScript compilation
npx tsc --noEmit && echo "Build OK" || echo "Build FAILED"

# 4. Run contract tests
npx hardhat test 2>&1 | tail -1
```
