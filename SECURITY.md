# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Active support  |
| < 1.0   | ❌ Not supported   |

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to **security@forgehealth.ai**.

You should receive a response within 48 hours. If for some reason you do not,
please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Design Principles

LUMEN SDK is designed with healthcare data security as a core requirement:

1. **PHI Never Transits** — The SDK operates on pointers and hashes, never raw Protected Health Information
2. **Zero Data Retention** — No patient data is stored, cached, or logged by the SDK
3. **Deterministic Scoring** — Same inputs produce same outputs; no side-channel data collection
4. **Cryptographic Audit Chain** — SHA-256 hash chains ensure tamper detection
5. **Compliance by Default** — PHIPA and HIPAA policy packs enforce regulatory constraints at runtime

For detailed security architecture, see [docs/SECURITY.md](docs/SECURITY.md).

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security patch versions

We follow coordinated disclosure and will credit reporters (unless they prefer anonymity).
