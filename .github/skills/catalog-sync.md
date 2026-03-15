# Skill: Catalog Sync

## When to use

- Updating catalog sync from remote sources, catalog version/load behavior, or token ingestion in the Theme Studio app (`vayeate-theme-studio/`).

## Steps

1. Review `vayeate-theme-studio/data/catalogs/` and `vayeate-theme-studio/src/gateway/services/catalog-sync.ts`.
2. Apply changes to sync logic and catalog version/load behavior.
3. Confirm catalog load and token extraction remain deterministic.
4. Validate remote-fetch and fallback behavior in tests.
5. Run `npm run test` and `npm run build`.

## Watch-outs

- Remote fetch failures should degrade gracefully with warnings.
- Do not convert warnings into hard failures unless explicitly required.
- Keep local-only workflow functional without remote access.
