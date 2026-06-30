# Template gateway

Persists theme templates under `data/templates/` as versioned JSON files. Validates wire data with `templateSchema` before write and on read.

## Modules

| File | Role |
|------|------|
| `template-gateway.ts` | Create, save, load, delete, and list templates by name/version. |

## Call flow

```
Operation → TemplateGateway → FileSystemService → Electron IPC
```

## Boundaries

- **In scope:** filename conventions (`<name>-<version>.template.json`), JSON serialization, zod parsing, factory-backed create.
- **Out of scope:** template validation rules, selection, undo — see `src/domain/template/` and related operations.

For gateway-layer conventions see the parent [README](../README.md).
