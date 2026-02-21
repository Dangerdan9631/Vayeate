# Functionality Reference

## Theme template workflow

- Edit template metadata, variables, and bindings in UI.
- Save/load workspace templates via local API endpoints.
- Persist preview session state into template JSON.

## Generation workflow

- Generate dark + light outputs from one template.
- Respect strategy semantics: `raw`, `deriveContrast`, `copyFromDark`.
- Export strict JSON with deterministic formatting.
- Apply safe write rules (atomic temp-write + rename).

## Preview workflow

- Side-by-side dark/light preview.
- Sample files from `examples/` (TS/JSON/MD/PS1/Rust).
- Output summary preview before write.

## Catalog workflow

- Maintain pinned source URLs and version policy.
- Sync local+remote snapshot.
- Validate snapshot quality and show drift warnings.
- Use catalog-driven key insertion and full-coverage binding generation.
