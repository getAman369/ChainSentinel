# Troubleshooting Guide & FAQ

Common issues, error messages, and solutions for ChainSentinel.

---

## FAQ

### General

**Q: What networks does ChainSentinel support?**
A: Base Mainnet (chainId: 8453) and Base Sepolia testnet (chainId: 84531). Other EVM-compatible networks can be added on request.

**Q: How accurate is the risk model?**
A: The RandomForest classifier achieves >99% accuracy on test data. However, synthetic training data may not reflect real-world distributions. Confidence scores should always be checked.

**Q: How long does an API request take?**
A: Typically 200-800ms. This includes blockchain RPC calls (100-300ms), ML inference (50-100ms via Python subprocess), and on-chain transaction confirmation (1-3s for attestation).

**Q: Is the on-chain attestation required?**
A: Yes — all screening requests write an attestation to Base L2. This is part of the compliance audit trail. For testing without on-chain writes, contact support.

**Q: How much does it cost?**
A: Base L2 gas is ~$0.01 per attestation. API pricing varies by plan — free tier: 1,000 screens/month.

### ML Model

**Q: Why is the confidence score low?**
A: Confidence below 0.5 indicates the model is uncertain. This typically happens for edge-case addresses with unusual patterns. Consider manual review.

**Q: Can I train my own model?**
A: Yes, the model is a standard scikit-learn RandomForestClassifier pickle file. You can retrain with your own labeled data using `ml/train_model.py`.

**Q: What features does the model use?**
A: 13 features: 7 raw (tx_count, counterparties, avg_value, max_value, contracts, days_active, mixing_score) and 6 engineered (tx_frequency, counterparty_diversity, value_concentration, contract_ratio, risk_velocity, activity_growth_rate).

### Smart Contracts

**Q: Is the contract verified on Basescan?**
A: Yes, verified at the deployment address. See `deployments.json` for the current address.

**Q: What happens if the contract is paused?**
A: When paused, no new attestations can be created (`whenNotPaused` modifier). Existing attestations remain valid. Contact admins to unpause.

**Q: Can attestations expire?**
A: Yes, attestations created with `createAttestationWithExpiry()` have an `expiresAt` timestamp. Use `isExpired(id)` to check.

---

## Troubleshooting

### 400 Bad Request

**Cause**: Invalid request body.

**Solutions**:
- Verify the `address` field is a valid Ethereum address (0x + 40 hex characters)
- Check that `chainId` is a number (8453 or 84531)
- If `txHash` is provided, it must be 0x + 64 hex characters
- Use the validation middleware to pre-validate before sending

```bash
# Validate address format
echo "0x1234567890123456789012345678901234567890" | grep -P "^0x[a-fA-F0-9]{40}$" && echo "Valid" || echo "Invalid"
```

### 429 Too Many Requests

**Cause**: Rate limit exceeded (100 requests/minute).

**Solutions**:
1. Implement exponential backoff in your client
2. Reduce request frequency
3. Use batch operations where possible
4. Contact support to increase your rate limit

```python
import time
import random

for attempt in range(5):
    resp = screen_address(addr)
    if resp.status_code == 429:
        sleep_time = (2 ** attempt) + random.uniform(0, 1)
        time.sleep(sleep_time)
    else:
        break
```

### 503 Service Unavailable

**Cause**: A dependency is down (blockchain provider, ML model, or wallet).

**Solutions**:
1. Check the `/health` endpoint for detailed dependency status
2. Verify `BASE_URL` and `BASE_SEPOLIA_URL` environment variables are set
3. Ensure `PRIVATE_KEY` is configured in `.env`
4. Confirm `ml/models/risk_model.pkl` exists

```bash
curl http://localhost:3000/health | jq .
```

### ML Inference Failed

**Cause**: The Python ML subprocess failed.

**Solutions**:
1. Verify Python 3.10+ is installed: `python3 --version`
2. Install ML dependencies: `pip install -r ml/requirements.txt`
3. Ensure model file exists: `ls ml/models/risk_model.pkl`
4. Test inference directly:
   ```bash
   python3 ml/infer.py '{"tx_count": 100, "counterparties": 50, "avg_value": 10.5, "max_value": 100.0, "contracts": 10, "days_active": 365, "mixing_score": 0.4}'
   ```
5. Retrain the model: `python3 ml/train_model.py`

### Smart Contract Write Failure

**Cause**: On-chain transaction failed or reverted.

**Solutions**:
1. Check wallet balance — you need ETH on Base for gas
2. Verify `PRIVATE_KEY` is correct and funded
3. Check if the contract is paused: `npx hardhat console` then `await registry.paused()`
4. Verify the contract address in `.env`: `BASE_SEPOLIA_REGISTRY_ADDRESS`
5. Redeploy if needed: `npm run deploy`

### Docker Issues

**Port already in use**:
```bash
docker-compose down
docker-compose up -d
```

**Python ML not available in container**:
```dockerfile
# Ensure Python dependencies are installed in the Docker build
# The Dockerfile handles this automatically, but you can test:
docker exec -it chainsentinel-api python3 ml/infer.py '{"tx_count": 100}'
```

### TypeScript Compilation Errors

```bash
# Install dependencies
npm ci

# Check for type errors
npx tsc --noEmit

# Rebuild dist
npm run build
```

---

## Diagnostic Commands

```bash
# Check API health
curl http://localhost:3000/health

# Test API screen endpoint
curl -X POST http://localhost:3000/api/v1/screen \
  -H "Content-Type: application/json" \
  -d '{"address": "0x1234567890123456789012345678901234567890"}'

# Run contract tests
npx hardhat test

# Compile contracts
npx hardhat compile

# Train ML model
python3 ml/train_model.py

# Test ML inference
python3 ml/infer.py '{"tx_count": 100, "counterparties": 50, "avg_value": 10.5, "max_value": 100.0, "contracts": 10, "days_active": 365, "mixing_score": 0.4}'

# View feature importance
python3 ml/feature_importance.py

# Test preprocessing pipeline
python3 -c "from ml.preprocess import run_health_check; print(run_health_check())"
```

---

## Need More Help?

- **Documentation**: https://docs.chainsentinel.io
- **Status Page**: https://status.chainsentinel.io
- **GitHub Issues**: https://github.com/opendao/OpenDAOhub/issues
- **Email**: support@chainsentinel.io

When reporting issues, please include:
1. The error message (with `requestId`)
2. Your API key (masked)
3. The address you were screening
4. Timestamp (UTC) of the request
