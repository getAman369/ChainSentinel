# ChainSentinel User Guide for Exchanges & DeFi Protocols

This guide explains how exchanges and DeFi protocols can integrate ChainSentinel
into their compliance and risk management workflows.

---

## Quick Start

### 1. Get API Access

```bash
curl -X POST https://api.chainsentinel.io/api/v1/screen \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"address": "0x1234567890123456789012345678901234567890"}'
```

**Response:**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "riskScore": 3,
  "riskLabel": "Medium",
  "confidence": 0.8734,
  "evidenceHash": "0xa1b2c3d4e5f6...",
  "attestationTx": "0x7890abcdef...",
  "attestationId": 42,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Integration Patterns

### Pattern 1: Pre-Transaction Screening (Recommended)

Screen addresses before processing deposits, withdrawals, or trades.

```python
from chainsentinel import ChainSentinelClient

cs = ChainSentinelClient(api_key="YOUR_API_KEY")

def process_withdrawal(user_address, amount):
    result = cs.screen(user_address)

    if result.risk_score >= 4:
        # Block high-risk addresses
        raise ComplianceError(f"Address flagged as {result.risk_label}")
    elif result.risk_score >= 3:
        # Require additional verification for medium risk
        require_manual_review(user_address, result.evidence_hash)

    # Safe to process
    execute_withdrawal(user_address, amount)
```

### Pattern 2: Batch Screening

Screen multiple addresses in a single request for efficiency.

```python
# Screen multiple addresses
addresses = ["0x...", "0x...", "0x..."]
results = cs.batch_screen(addresses, chain_id=8453)

# Store attestation IDs for audit trail
for r in results:
    audit_log.append({
        "address": r.address,
        "risk_score": r.risk_score,
        "attestation_id": r.attestation_id,
        "tx_hash": r.attestation_tx,
    })
```

### Pattern 3: Historical Verification

Verify past screening results against the on-chain attestation.

```python
# Retrieve on-chain attestation
attestation = cs.get_attestation("0x...")

# Verify it matches your records
assert attestation.risk_score == stored_risk_score
assert attestation.valid == True
```

---

## Risk Score Guide

| Score | Label | Recommended Action |
|-------|-------|--------------------|
| 1 | Minimal | Auto-approve. Normal activity pattern. |
| 2 | Low | Standard monitoring. No additional friction. |
| 3 | Medium | Consider additional verification (e.g., Proof of Funds). |
| 4 | High | Block or require manual review by compliance team. |
| 5 | Critical | Block. Known bad actor, mixer, or sanctioned address. |

### Confidence Thresholds

Always check the confidence score:

```javascript
const result = await screenAddress(address);

if (result.confidence < 0.7) {
  // Low confidence — flag for manual review regardless of score
  sendToManualReview(address, result);
} else if (result.riskScore >= 4) {
  // High confidence + high risk — block
  blockAddress(address);
}
```

> **Default threshold**: 0.5. Configure via the `CONFIDENCE_THRESHOLD` environment variable.

---

## On-Chain Attestation Workflow

Each screening creates an **immutable on-chain attestation** on Base L2.

### Why Attest On-Chain?

1. **Audit Trail**: Regulators can verify your screening process
2. **Non-repudiation**: Addresses cannot dispute being screened
3. **Cross-platform**: Other protocols can query your attestation history
4. **Compliance**: Meets regulatory requirements for transaction monitoring logs

### Attestation Lifecycle

```
Screen Address
     ↓
ML Risk Assessment
     ↓
Create On-Chain Attestation (Base L2)
     ↓
Return Attestation ID + TX Hash
```

### Verifying an Attestation

```solidity
// Solidity — check if an address has been screened
AttestationRegistry registry = AttestationRegistry(0x...);

(bool valid, uint8 riskScore) = checkAttestation(
    registry, "0x..."
);

if (!valid) {
    revert("Address not screened or attestation revoked");
}

if (riskScore >= 4) {
    revert("High-risk address");
}
```

---

## API Best Practices

### Rate Limits

- **100 requests/minute** per API key
- **429** response when exceeded
- Use exponential backoff if you hit rate limits

```python
import time
import random

def call_with_backoff(fn, max_retries=5):
    for attempt in range(max_retries):
        try:
            return fn()
        except RateLimitError:
            wait = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(wait)
    raise MaxRetriesExceeded()
```

### Caching Strategy

Cache screening results for 24 hours to reduce API calls:

```javascript
// Check local cache first
const cached = redis.get(`screen:${address}`);
if (cached) {
  return JSON.parse(cached);
}

// Screen and cache
const result = await cs.screen(address);
redis.setex(`screen:${address}`, 86400, JSON.stringify(result));
```

### Error Handling

```javascript
try {
  const result = await screenAddress(address);
  // Process result
} catch (error) {
  if (error.status === 400) {
    // Invalid address format
    console.error("Validation error:", error.message);
  } else if (error.status === 429) {
    // Rate limited — retry after delay
    await sleep(60000); // Wait 1 minute
    return retryScreening(address);
  } else {
    // Internal error — log and alert
    console.error("Unexpected error:", error);
  }
}
```

---

## Compliance Checklist

For exchanges and DeFi protocols implementing ChainSentinel:

- [ ] Screen all new addresses before interaction
- [ ] Store attestation IDs in your audit logs
- [ ] Implement confidence threshold checking (≥0.7 recommended)
- [ ] Set up rate limit handling with retry logic
- [ ] Configure alerts for Critical risk scores (5)
- [ ] Regularly back up attestation records
- [ ] Train compliance team on risk score meanings

---

## Support

- **Documentation**: https://docs.chainsentinel.io
- **Status Page**: https://status.chainsentinel.io
- **Support**: support@chainsentinel.io
- **GitHub**: https://github.com/opendao/OpenDAOhub
