# Governance & Contribution

## Decision Making
- **Architectural Decisions:** Must be documented in an ADR (Architecture Decision Record) within `docs/architecture/adrs/`.
- **UI Changes:** Must pass the "Premium Standard" review (Dark mode compliance, Animation smoothness).

## Review Process
1. **Pull Request:** Create a PR with a descriptive title.
2. **Automated Checks:** CI runs Linting and Unit Tests.
3. **Peer Review:** Requires 1 approval from a Senior Engineer.
4. **Merge:** Squash and Merge into `main`.

## Release Cadence
- **Continuous Deployment:** Merges to `main` are automatically deployed to the Staging environment.
- **Production:** Weekly releases tagged with Semantic Versioning.

## Code of Conduct
- Be respectful.
- Critique the code, not the coder.
- Assume positive intent.
