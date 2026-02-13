# ADR 004: BSL License

## Status

**Accepted** — 2026-02-13

## Context

Forge Partners Inc. is positioning for potential acquisition. Licensing strategy directly impacts:

1. **IP valuation** — What acquirers can exclusively own
2. **Customer lock-in** — Ability to offer differentiated value
3. **Competitive moat** — Protection from fast followers
4. **Open source goodwill** — Community and ecosystem benefits

We evaluated several licensing options:

### Options Considered

| License | Pros | Cons |
|---------|------|------|
| MIT | Maximum adoption | No IP protection, competitors can use freely |
| Apache 2.0 | Patent protection, industry standard | Still permissive, limited differentiation |
| GPL/AGPL | Strong copyleft | Toxic to healthcare enterprises, adoption barrier |
| Proprietary | Maximum IP protection | Zero ecosystem, hard to get traction |
| Elastic/SSPL | Source available | Recently controversial, AWS conflict |
| BSL 1.1 | Time-delayed open source, competition protection | Less well-known, requires explanation |

## Decision

We will use the **Business Source License 1.1 (BSL 1.1)** for LUMEN SDK, LUMEN UI, and related products.

### BSL 1.1 Parameters

```
Licensor: Forge Partners Inc.
Licensed Work: LUMEN SDK, LUMEN UI, LUMEN Scanner
Additional Use Grant: Non-competing use allowed
Change Date: 4 years from publication
Change License: Apache License 2.0
```

### What BSL 1.1 Means

#### During BSL Period (First 4 Years)

✅ **Allowed without cost:**
- Development and testing
- Internal production use
- Academic research
- Non-competing commercial use (e.g., hospital using LUMEN)

❌ **Requires commercial license:**
- Using LUMEN to build a competing AI governance product
- Offering LUMEN as a service to third parties
- Embedding in competing platforms

#### After Change Date (4+ Years)

All uses become permitted under Apache 2.0, including competing uses.

### Why BSL Over Alternatives

#### vs. MIT/Apache

- **IP Protection**: BSL prevents competitors from using our code against us during critical growth phase
- **Acquisition Readiness**: Acquirers get protected IP with path to monetization
- **Time-limited**: Eventually becomes truly open source (Apache 2.0)

#### vs. GPL

- **Enterprise-friendly**: No copyleft requirements
- **Adoption**: Healthcare enterprises avoid GPL due to compliance concerns
- **Integration**: Can be integrated with proprietary systems

#### vs. Fully Proprietary

- **Ecosystem**: Still allows community contributions and non-competing use
- **Adoption**: Hospitals can adopt without commercial negotiation
- **Trust**: Source-available builds trust with security teams

#### vs. Elastic/SSPL

- **Predictable**: Well-defined 4-year timeline
- **Standard**: Becomes Apache 2.0 (industry standard)
- **Non-controversial**: No cloud provider conflicts

## Acquisition Alignment

BSL is specifically designed for companies with acquisition potential:

### For Potential Acquirers

1. **Protected IP**: 4-year exclusive window to monetize
2. **Customer base**: Non-competing users are already licensed
3. **Ecosystem**: Community contributions enhance value
4. **Future value**: Eventually open source extends reach

### Valuation Impact

| Factor | BSL Impact |
|--------|------------|
| Defensible IP | High — 4-year protection |
| Revenue potential | High — commercial licensing revenue |
| Market adoption | Medium-High — free for target users |
| Strategic value | High — exclusive technology window |

## Consequences

### Positive

- **Competitive protection**: Fast followers can't use our code
- **Revenue option**: Commercial licenses for competing use cases
- **Adoption**: Target market (healthcare) can use freely
- **Future-proof**: Automatically becomes Apache 2.0
- **Acquisition-ready**: Clean IP portfolio for due diligence

### Negative

- **Education required**: BSL less well-known than MIT/Apache
- **Community skepticism**: Some OSS advocates distrust non-OSI licenses
- **License complexity**: More complex than permissive licenses
- **Commercial friction**: Competing uses require negotiation

### Mitigations

- Clear FAQ on website explaining BSL
- Explicit examples of allowed vs. prohibited uses
- Streamlined commercial licensing process
- Regular communication about Change Date

## Related Documents

- [LICENSE](../LICENSE) — Full BSL 1.1 text
- [Terms of Service](../TERMS_OF_SERVICE.md) — Commercial terms
- Business Source License FAQ: https://mariadb.com/bsl-faq-mariadb/

## Decision Owner

**Legal & Executive Team**

This decision was made with input from:
- Legal counsel
- Potential acquirer discussions
- Healthcare enterprise customers
- Open source strategy consultants

---

**Review Date:** 2027-02-13 (annual review)
