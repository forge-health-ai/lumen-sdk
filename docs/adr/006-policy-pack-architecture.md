# ADR 006: Policy Pack Architecture

## Status

**Accepted** — 2026-02-13

## Context

Policy packs are versioned governance artifacts containing compliance rules for specific jurisdictions (PHIPA, HIPAA, NIST AI RMF, etc.). A key architectural decision is how these packs are distributed and updated.

### Requirements

1. **Freshness**: Packs must reflect current regulations
2. **Availability**: Packs must be available offline (hospital networks)
3. **Modularity**: Users should load only relevant jurisdictions
4. **Update propagation**: New regulations must reach users quickly
5. **Versioning**: Users must know which pack version they're using

### Options Considered

1. **Bundled only**: Packs ship with npm package, updated with releases
2. **Hosted only**: Packs fetched from API on demand
3. **Hybrid**: Bundled fallback + hosted for updates (our choice)
4. **Git-based**: Packs pulled from Git repository

## Decision

We will implement a **hybrid policy pack architecture** with:

1. **Bundled packs** — Shipped with SDK for offline operation
2. **Hosted packs** — Fetched from `api.forgelumen.ca` for updates
3. **Automatic fallback** — If hosted unavailable, use bundled
4. **Version negotiation** — SDK requests compatible pack versions

### Architecture

```
┌─────────────────┐     ┌─────────────────────┐
│   LUMEN SDK     │◄────┤  api.forgelumen.ca  │
│                 │     │  (Hosted Packs)     │
│  ┌───────────┐  │     └─────────────────────┘
│  │ Bundled   │  │              │
│  │ Packs     │  │     ┌────────▼────────┐
│  │ (v1.0.0)  │  │     │  Pack Registry  │
│  └─────┬─────┘  │     │  (Versioning)   │
│        │        │     └─────────────────┘
│  ┌─────▼────────┴──┐
│  │  Pack Resolver  │
│  │  (Merge/Fallbk) │
│  └─────┬───────────┘
│        │
│  ┌─────▼───────────┐
│  │ Active Policy   │
│  │ Set             │
│  └─────────────────┘
```

### Pack Resolution Logic

```typescript
async function resolvePacks(requested: string[]): Promise<PolicyPack[]> {
  const resolved: PolicyPack[] = [];
  
  for (const packId of requested) {
    // Try hosted first
    const hosted = await fetchHostedPack(packId);
    
    if (hosted && hosted.version > bundledPacks[packId]?.version) {
      // Use newer hosted pack
      resolved.push(hosted);
      cachePack(hosted);
    } else {
      // Use bundled or cached
      resolved.push(cachedPacks[packId] || bundledPacks[packId]);
    }
  }
  
  return resolved;
}
```

### Pack Format

```typescript
interface PolicyPack {
  id: string;           // e.g., "ca-on-phipa"
  version: string;      // Semantic version
  jurisdiction: string; // e.g., "CA-ON"
  frameworks: string[]; // ["PHIPA", "PIPEDA", "NIST-AI-RMF"]
  rules: PolicyRule[];
  updatedAt: string;    // ISO 8601
  hash: string;         // SHA-256 of content
  signature: string;    // Ed25519 signature
}

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  condition: RuleCondition;
  action: 'ALLOW' | 'REVIEW' | 'DENY';
}
```

### Jurisdiction Modularity

Packs are organized by jurisdiction:

```
packs/
├── ca/
│   ├── ca-on-phipa.json      # Ontario
│   ├── ca-bc-pipa.json       # British Columbia
│   └── ca-fed-pipeda.json    # Federal
├── us/
│   ├── us-fed-hipaa.json     # HIPAA
│   ├── us-fed-nist-ai.json   # NIST AI RMF
│   └── us-co-ai-2026q1.json  # Colorado AI Act
└── eu/
    └── eu-ai-act.json        # EU AI Act
```

Users load only relevant packs:

```typescript
const lumen = new Lumen({
  domain: 'healthcare',
  region: 'canada',
  packs: ['ca-on-phipa', 'ca-fed-pipeda']  // Ontario healthcare
});
```

### Update Propagation

1. **LUMEN Scanner** detects regulatory changes
2. **Pack maintainers** update pack definitions
3. **New pack version** published to hosted registry
4. **SDK checks** for updates on initialization (with caching)
5. **Users notified** of critical updates in evaluation responses

### Caching Strategy

```typescript
interface PackCache {
  packId: string;
  version: string;
  content: PolicyPack;
  fetchedAt: string;
  ttl: number;  // Time-to-live in hours
}

// Default TTL: 24 hours for non-critical packs
// Critical updates: Immediate via SDK notification
```

### Version Compatibility

Packs specify compatible SDK versions:

```json
{
  "id": "ca-on-phipa",
  "version": "2.1.0",
  "sdkCompatibility": ">=1.0.0 <3.0.0",
  "breakingChanges": false
}
```

SDK warns if pack requires newer version.

## Consequences

### Positive

- **Offline operation**: Bundled packs work without internet
- **Freshness**: Hosted packs provide latest regulations
- **Resilience**: Automatic fallback if hosted service unavailable
- **Modularity**: Load only relevant jurisdictions
- **Performance**: Cached packs minimize API calls
- **Security**: Signed packs prevent tampering

### Negative

- **Complexity**: Two code paths (bundled vs. hosted)
- **Cache invalidation**: Complex cache management
- **Version skew**: Different users on different pack versions
- **Bandwidth**: Initial pack download size

### Mitigations

- Clear documentation on fallback behavior
- Background pack updates (don't block evaluation)
- Pack size limits (compress rules)
- Version notification system

## Update Triggers

Users receive pack update notifications when:

1. **Critical regulatory change**: Immediate notification
2. **Framework version change**: Next SDK initialization
3. **Security patch**: Immediate notification
4. **Regular update**: Weekly check

## Related

- LUMEN Scanner: Detects regulatory changes
- Pack Registry API: `api.forgelumen.ca/v1/packs`
- Semantic Versioning: https://semver.org/

---

**Decision Owner:** Architecture Team  
**Review Date:** 2026-04-01
