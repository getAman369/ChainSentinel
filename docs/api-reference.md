# ChainSentinel API Reference

Complete API reference for the ChainSentinel AML/Fraud Detection API.

## Authentication

All API requests require an API key in the `X-API-Key` header (when configured).

```bash
curl -H "X-API-Key: your-api-key" https://api.chainsentinel.io/api/v1/screen
```

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: Rate limit info included in response headers
- **Exceeding limit**: `429 Too Many Requests`

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Description of the error",
  "details": ["Optional list of validation errors"],
  "requestId": "unique-request-id"
}
```

> The `requestId` field is present when the request reached the API. Use it when reporting issues.

---

## Endpoints

### POST /api/v1/screen

Screen an Ethereum address for AML/fraud risk. Returns a risk score (1-5), confidence, and on-chain attestation reference.

#### Request

```
POST /api/v1/screen
Content-Type: application/json
```

**Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `address` | string | Yes | — | Ethereum address (0x + 40 hex chars) |
| `txHash` | string | No | null | Optional transaction hash for context |
| `chainId` | integer | No | 8453 | Chain ID: 8453 = Base mainnet, 84531 = Base Sepolia |
| `confidence_threshold` | float | No | 0.5 | Minimum confidence for reliable prediction (0-1) |

#### Example Request

```bash
curl -X POST https://api.chainsentinel.io/api/v1/screen \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "txHash": "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
    "chainId": 8453
  }'
```

#### Response

**Status:** 200 OK

```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "riskScore": 3,
  "riskLabel": "Medium",
  "confidence": 0.8734,
  "confidenceThreshold": 0.5,
  "belowThreshold": false,
  "allProbabilities": {
    "1": 0.01,
    "2": 0.05,
    "3": 0.87,
    "4": 0.06,
    "5": 0.01
  },
  "evidenceHash": "0xa1b2c3d4e5f6...",
  "attestationTx": "0x7890abcdef...",
  "attestationId": 42,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | Screened address |
| `riskScore` | integer | Risk score 1-5 (1=Minimal, 5=Critical) |
| `riskLabel` | string | Human-readable risk label |
| `confidence` | float | Model confidence (0-1) |
| `belowThreshold` | boolean | Whether confidence is below the threshold |
| `evidenceHash` | string | On-chain evidence reference |
| `attestationTx` | string | Transaction hash of on-chain attestation |
| `attestationId` | integer | Attestation ID in the registry contract |
| `timestamp` | string | ISO 8601 timestamp |

### GET /api/v1/attestations/:address

Retrieve the latest attestation and history count for an address.

#### Request

```
GET /api/v1/attestations/0x1234567890123456789012345678901234567890
```

#### Response

**Status:** 200 OK

```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "attestationId": 42,
  "riskScore": 3,
  "riskLabel": "Medium",
  "evidenceHash": "0xa1b2c3d4e5f6...",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "valid": true,
  "totalAttestations": 3
}
```

| Field | Type | Description |
|-------|------|-------------|
| `attestationId` | integer | ID of the latest attestation |
| `riskScore` | integer | Risk score at time of attestation |
| `riskLabel` | string | Human-readable risk label |
| `evidenceHash` | string | Evidence hash stored on-chain |
| `timestamp` | string | ISO 8601 timestamp |
| `valid` | boolean | Whether the attestation is still valid |
| `totalAttestations` | integer | Total attestations for this address |

### GET /health

Check the health status of the API and its dependencies.

#### Response

**Status:** 200 OK (healthy) or 503 Service Unavailable (degraded)

```json
{
  "status": "ok",
  "service": "ChainSentinel",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "dependencies": {
    "blockchain": {
      "status": "ok",
      "blockNumber": 12345678
    },
    "ml_model": {
      "status": "ok",
      "size": 221769
    },
    "smart_contract": {
      "status": "configured",
      "address": "0x..."
    },
    "wallet": {
      "status": "configured"
    }
  }
}
```

### GET /api/v1

API root endpoint listing available endpoints and version.

#### Response

```json
{
  "service": "ChainSentinel",
  "version": "v1",
  "endpoints": {
    "screen": "POST /api/v1/screen",
    "attestations": "GET /api/v1/attestations/:address",
    "health": "GET /health",
    "docs": "GET /api/v1/docs"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### GET /api/v1/docs

Retrieve the OpenAPI 3.0 specification for this API.

---

## Risk Scores

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Minimal | Low-risk address, normal activity |
| 2 | Low | Some suspicious patterns |
| 3 | Medium | Moderate risk indicators |
| 4 | High | Strong risk signals |
| 5 | Critical | Known bad actor, mixer, sanctioned |

---

## SDK Examples

### JavaScript / Node.js

```javascript
const response = await fetch('https://api.chainsentinel.io/api/v1/screen', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
  },
  body: JSON.stringify({
    address: '0x1234567890123456789012345678901234567890',
    chainId: 8453,
  }),
});

const result = await response.json();
console.log(`Risk: ${result.riskLabel} (${result.riskScore}/5)`);
```

### Python

```python
import requests

response = requests.post(
    'https://api.chainsentinel.io/api/v1/screen',
    json={
        'address': '0x1234567890123456789012345678901234567890',
        'chainId': 8453,
    },
    headers={'X-API-Key': 'your-api-key'},
)
result = response.json()
print(f"Risk: {result['riskLabel']} ({result['riskScore']}/5)")
```

### cURL

```bash
curl -X POST https://api.chainsentinel.io/api/v1/screen \
  -H "Content-Type: application/json" \
  -d '{"address": "0x1234567890123456789012345678901234567890"}'
```

---

## Smart Contract Integration

### ChainSentinel AttestationRegistry

The API writes attestations to the `AttestationRegistry` contract on Base L2.

**Key Functions:**

```solidity
function createAttestation(address subject, uint8 riskScore, bytes32 evidenceHash) external;
function batchCreateAttestations(address[] subjects, uint8[] riskScores, bytes32[] evidenceHashes) external;
function getLatestAttestation(address subject) external view returns (uint256, uint8, bytes32, uint256, bool);
function getAttestationsBySubject(address subject, uint256 offset, uint256 limit) external view returns (...);
function pause() external onlyOwner;
function grantRole(bytes32 role, address account) external onlyOwner;
```

**Events:**

```solidity
event AttestationCreated(uint256 indexed id, address indexed subject, uint8 riskScore, bytes32 evidenceHash, uint256 timestamp);
event BatchAttestationCreated(bytes32 indexed batchId, address indexed attestor, uint256 count, uint256 startId, uint256 endId);
event AttestationRevoked(uint256 indexed id, address indexed revoker);
event AttestationExpired(uint256 indexed id, uint256 expiresAt);
```
