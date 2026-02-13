# Contributing to LUMEN SDK

Thank you for your interest in contributing to LUMEN SDK! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We are committed to providing a harassment-free experience for everyone.

## How to Contribute

### Reporting Issues

1. **Check existing issues** — Search [GitHub Issues](https://github.com/braebrae88/lumen-sdk/issues) to avoid duplicates
2. **Use issue templates** — Fill out the appropriate template completely
3. **Provide context** — Include version, environment, and reproduction steps

### Submitting Changes

1. **Fork the repository**
2. **Create a feature branch** — `git checkout -b feature/your-feature-name`
3. **Make your changes** — Follow our coding standards
4. **Write tests** — Maintain or improve coverage
5. **Update documentation** — Keep docs in sync with code
6. **Submit a pull request** — Use the PR template

### Pull Request Guidelines

- **One feature per PR** — Keep changes focused
- **Write clear commit messages** — Follow [Conventional Commits](https://www.conventionalcommits.org/)
- **Include tests** — PRs without tests for new features will not be merged
- **Update CHANGELOG.md** — Document your changes
- **Pass CI checks** — All tests and linting must pass

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/lumen-sdk.git
cd lumen-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Type check
npm run typecheck
```

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true`)
- Export types explicitly
- Document public APIs with JSDoc
- Use descriptive variable names

### File Structure

```
src/
├── primitives/     # Core data structures
├── scoring/        # LUMEN Score algorithm
├── adapters/       # LLM provider adapters
└── index.ts        # Public API exports
```

### Naming Conventions

- **Files**: `PascalCase.ts` for classes, `camelCase.ts` for utilities
- **Types/Interfaces**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

### Documentation

- All public APIs must have JSDoc comments
- Include `@example` for complex functions
- Keep README.md up to date
- Add ADRs for significant architectural decisions

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/scoring/LumenScore.test.ts
```

### Test Guidelines

- Test files go next to source files: `Foo.ts` → `Foo.test.ts`
- Use descriptive test names: `it('should return ALLOW when score exceeds threshold')`
- Test edge cases and error conditions
- Mock external dependencies

## Architecture Decision Records (ADRs)

For significant architectural changes, create an ADR:

```
docs/ADR/
├── 001-scoring-kernel.md
├── 002-constraint-engine.md
└── NNN-your-decision.md
```

Use the template:
- **Status**: Proposed / Accepted / Deprecated
- **Context**: Why is this decision needed?
- **Decision**: What did we decide?
- **Consequences**: What are the tradeoffs?

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.x.x`
4. Push: `git push origin main --tags`
5. CI publishes to npm

## Questions?

- **GitHub Issues** — For bugs and feature requests
- **Email** — hello@forgehealth.ai for other inquiries

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.

---

Thank you for contributing to LUMEN SDK! Your efforts help make AI governance accessible to healthcare organizations worldwide.
