# Conventions Reference

## Change scope conventions

- Implement new tool behavior under `vayeate-theme-studio/`.
- Keep root extension packaging flow unchanged unless explicitly requested.
- Make focused changes; avoid unrelated cleanup.

## Style conventions

- Follow existing TypeScript style in nearby files.
- Use explicit types for domain-critical structures.
- Keep generation and serialization deterministic.

## Testing conventions

- Add tests when generation/parity/catalog rules change.
- Prefer specific unit tests near changed logic before broad checks.
- Validate with:
  - `npm run test`
  - `npm run build`

## Documentation conventions

- Update docs when behavior or workflows change.
- Keep agent docs in `.github/agent-docs/` and route from `AGENTS.md`.
- Keep Copilot-facing instructions in `.github/copilot-instructions.md`.
