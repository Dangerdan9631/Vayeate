---
applyTo: "**/*"
---

> **Apply only when:** Use when authoring, modifing, or interacting with Gateway types - services and gateways

# Layer: gateway

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When layer-wide gateway/service file conventions change, update those `describe` blocks and the dedicated rule files, and vice versa.**

## Services

- Talk to **outside systems**: filesystem, IPC bridge, shell, native APIs.
- **No** domain/business rules; system-oriented error handling is OK.

## Gateways

- **Abstractions** over services: parse/serialize, map JSON ↔ model types.
- **No** business logic; conversion and I/O orchestration at the edge only.

## Callers

- **Operations** invoke gateways/services (not components/handlers).
- **`@singleton()`** on gateway/service classes; inject **concrete types** — no string or symbol tokens.

## Good / bad

```ts
// BAD — gateway decides "is catalog valid for publish"
if (catalog.tokens.length < 5) throw ...

// GOOD — gateway reads/writes bytes or IPC; operation decides validity
const raw = await this.fileService.read(path);
return CatalogGateway.parse(raw);
```