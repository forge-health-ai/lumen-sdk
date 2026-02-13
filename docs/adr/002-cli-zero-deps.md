# ADR 002: CLI Zero Dependencies

## Status

**Accepted** — 2026-02-13

## Context

The LUMEN SDK includes a CLI tool (`lumen init`) for initializing policy packs and configuration. This CLI runs in sensitive environments:

- Hospital IT networks with strict security controls
- Air-gapped systems without internet access
- CI/CD pipelines with minimal base images
- Developer machines with corporate restrictions

Many enterprise environments block or heavily scrutinize:
- External network calls during installation
- Large dependency trees (supply chain attacks)
- Native compiled modules (reproducibility concerns)
- Post-install scripts (security risk)

We needed to decide on the dependency strategy for the CLI component.

### Options Considered

1. **Full dependency tree** — Use existing npm ecosystem (axios, chalk, inquirer, etc.)
2. **Zero external dependencies** — Use only Node.js built-in modules
3. **Bundled dependencies** — Vend all deps into the package
4. **Separate CLI package** — Split CLI from SDK

## Decision

We will implement the CLI with **zero external dependencies** — using only Node.js built-in modules.

### Implementation Details

#### Allowed Modules

Only these Node.js built-in modules are used:

- `fs` — File system operations
- `path` — Path manipulation
- `http`/`https` — HTTP requests (built-in, no fetch polyfill)
- `crypto` — Hashing and randomness
- `readline` — Interactive prompts
- `util` — Utilities
- `stream` — Streaming data
- `zlib` — Compression

#### What We Avoided

| Common Package | Our Replacement |
|----------------|-----------------|
| axios/fetch | Native `http`/`https` modules |
| chalk/colors | ANSI escape codes directly |
| inquirer | Native `readline` module |
| commander | Native `process.argv` parsing |
| lodash | Native array/object methods |
| rimraf | Native `fs.rm` with recursion |

#### Example: HTTP Request Without Axios

```typescript
// Instead of axios.get(url)
const https = require('https');

function get(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}
```

#### Example: CLI Colors Without Chalk

```typescript
// Instead of chalk.green(text)
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function green(text: string): string {
  return `${GREEN}${text}${RESET}`;
}
```

## Consequences

### Positive

- **Supply chain security**: No risk from compromised dependencies
- **Air-gappable**: Works without npm install in restricted environments
- **Fast installation**: No dependency resolution or download time
- **Predictable**: Behavior is entirely in our code
- **Auditable**: Security teams can review all code
- **No post-install scripts**: Eliminates a common attack vector
- **Small bundle**: CLI is <50KB vs potentially MB with deps

### Negative

- **Development effort**: Re-implementing functionality libraries provide
- **Maintenance burden**: Own the code for features like HTTP retries
- **Feature limitations**: No fancy CLI features (progress bars, spinners)
- **Testing**: Must thoroughly test our implementations

### Mitigations

- Keep CLI scope minimal (init, config, simple queries)
- Rich functionality stays in the main SDK (which has normal deps)
- Comprehensive test coverage for native implementations
- Document security benefits for enterprise customers

## Related

- Node.js built-in modules: https://nodejs.org/api/
- Supply chain attack examples: https://snyk.io/blog/npm-security-malicious-packages/

---

**Decision Owner:** Security Team  
**Review Date:** 2026-06-01
