# ADR-003: API Versioning Strategy

- **Date**: 2025-01-10
- **Status**: Accepted
- **Deciders**: ChainSentinel Engineering Team

## Context

The API will evolve over time. We need a versioning strategy that allows backward
compatibility during upgrades without breaking existing clients.

## Decision

**URL Path Versioning** with `/api/v1/` prefix as the primary strategy.

### Current Implementation
```
POST /api/v1/screen          — Screen an address
GET  /api/v1/attestations/:address — Get attestation history
GET  /api/v1/                 — API root (version info)
GET  /api/v1/docs             — OpenAPI specification
GET  /health                  — Health check (version-independent)
```

### Versioning Rules
1. Increment major version (`v2`) for breaking changes
2. Keep old versions running for 30 days after new version release
3. Deprecation notice in response headers: `X-API-Deprecation: version v1 is deprecated, migrate to v2 by YYYY-MM-DD`
4. Sunset header on deprecated endpoints: `Sunset: Tue, 01 Jul 2025 00:00:00 GMT`

## Rationale

| Strategy | Pros | Cons |
|----------|------|------|
| URL Path (chosen) | Simple, human-readable, cache-friendly | Changes to path break clients |
| Header (Accept-Version) | Clean URLs | Harder to test, requires header management |
| Query Param (?v=1) | Easy to implement | Often stripped by proxies/cache |

URL path versioning was chosen because:
- It is the most intuitive for API consumers
- Works correctly with CDN caching
- Each version can be deployed as a separate container
- Easy to test with plain HTTP tools

## Consequences

- **Positive**: Clear version boundary; old versions don't affect new ones
- **Positive**: Easy to deploy and test specific versions
- **Negative**: URL changes required for version upgrades
- **Negative**: Path-based versioning can't be hidden behind a single endpoint
