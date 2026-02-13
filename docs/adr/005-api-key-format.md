# ADR 005: API Key Format

## Status

**Accepted** — 2026-02-13

## Context

The LUMEN hosted API requires authentication. API keys are the primary mechanism. We need to decide:

1. **Key format** — Structure and encoding
2. **Generation method** — How keys are created
3. **Storage** — How keys are stored in our database
4. **Display** — When and how users see their keys

Security requirements:
- Keys must be unguessable
- Keys must be verifiable without storing plaintext
- Compromised keys must be revocable
- Key provenance must be trackable (environment, creation time)

## Decision

We will use the following API key scheme:

### Format

```
lumen_pk_{environment}_{random}
```

Where:
- `lumen_pk_` — Prefix indicating LUMEN production key
- `{environment}` — `prod`, `staging`, or `dev`
- `{random}` — 32-character URL-safe base64 random string

Example: `lumen_pk_prod_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6`

### Generation

```typescript
import { randomBytes } from 'crypto';

function generateApiKey(environment: 'prod' | 'staging' | 'dev'): string {
  const random = randomBytes(24).toString('base64url');  // 32 chars
  return `lumen_pk_${environment}_${random}`;
}
```

Key properties:
- **192 bits of entropy** (24 bytes) = unguessable
- **Base64URL encoding** — URL-safe, no padding issues
- **Environment prefix** — Immediate environment identification

### Storage

API keys are stored as **bcrypt hashes** with cost factor 12:

```typescript
import { hash, compare } from 'bcrypt';

// Storing
const keyHash = await hash(apiKey, 12);
await db.storeKey({ 
  keyHash, 
  environment,
  createdAt,
  userId 
});

// Verifying
const isValid = await compare(providedKey, storedHash);
```

**Critical: Only the hash is stored. The plaintext key is never stored.**

### Display Policy

**Keys are shown exactly once — at creation time.**

Flow:

1. User requests new API key
2. System generates key
3. System displays key to user: **"Copy this now. It will never be shown again."**
4. System stores hash only
5. User copies key to secure storage

No "view key" functionality exists. If a user loses their key, they must:
1. Revoke the old key
2. Generate a new key

### Key Metadata

Additional fields stored per key:

```typescript
interface ApiKeyRecord {
  id: string;
  keyHash: string;        // bcrypt hash
  environment: string;    // prod/staging/dev
  userId: string;         // Owner
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  name: string | null;    // User-provided label
}
```

### Key Rotation

- Users can have up to 2 active keys (for rotation)
- Keys can be revoked immediately
- Revoked keys are kept in database for audit (marked revoked)
- Usage statistics tracked per key

### Transmission Security

- Keys must be sent over HTTPS only
- Keys are in `Authorization: Bearer {key}` header
- Keys are never logged (redacted in logs)
- Keys are never in URLs

## Consequences

### Positive

- **High security**: 192-bit entropy, bcrypt hashing
- **No plaintext storage**: Compromised database doesn't expose keys
- **Environment isolation**: Keys scoped to environments
- **Clear UX**: "Shown once" policy is clear to users
- **Audit trail**: Complete history of key usage
- **Standards compliant**: Follows OWASP API security guidelines

### Negative

- **UX friction**: Users must save keys immediately
- **Support burden**: Lost keys require regeneration
- **No key recovery**: Impossible by design
- **bcrypt cost**: ~100ms per verification (acceptable)

### Mitigations

- Clear UI messaging about "shown once" policy
- Easy key regeneration flow
- Allow multiple keys for rotation without downtime
- Key naming to help users remember purpose

## Comparison with Alternatives

| Approach | Pros | Cons |
|----------|------|------|
| Plaintext storage | Easy retrieval | Catastrophic if DB breached |
| Encrypted storage | Retrievable | Key management complexity |
| Hash only (our choice) | Maximum security | No recovery possible |
| JWT tokens | Self-contained | Revocation complexity |

## Related

- OWASP API Security Top 10: https://owasp.org/www-project-api-security/
- bcrypt: https://www.npmjs.com/package/bcrypt
- Base64URL: RFC 4648

---

**Decision Owner:** Security Team  
**Review Date:** 2026-06-01
