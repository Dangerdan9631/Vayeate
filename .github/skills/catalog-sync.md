# Skill: Catalog Sync

## When to use

- Updating pin metadata, remote source ingestion, or drift validation behavior.

## Steps

1. Review `catalog/pin.json` and `src/core/catalog-sync.ts`.
2. Apply changes to pin validation and sync logic.
3. Confirm snapshot/report artifact behavior remains deterministic.
4. Validate drift warning behavior in tests.
5. Run `npm run test` and `npm run build`.

## Watch-outs

- Remote fetch failures should degrade gracefully with warnings.
- Do not convert warnings into hard failures unless explicitly required.
- Keep local-only workflow functional without remote access.
