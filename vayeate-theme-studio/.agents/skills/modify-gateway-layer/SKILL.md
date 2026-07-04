---
name: modify-gateway-layer
description: Gateway layer patterns for services, gateways, web workers, and system integration. Use when authoring, modifying, or interacting with gateway types
---

# Layer: gateway

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When layer-wide gateway/service file conventions change, update those `describe` blocks and the dedicated rule files, and vice versa.**

## Services

- Talk to **outside systems**: filesystem, IPC bridge, shell, native APIs.
- **No** domain/business rules; system-oriented error handling is OK.
- Live under `src/gateway/services/<Domain>/`, where `<Domain>` is `Common`, `Catalog`, `Template`, or `Theme`. Shared system services currently belong under `src/gateway/services/Common/`.

## Gateways

- **Abstractions** over services: parse/serialize, map JSON ↔ model types.
- **No** business logic; conversion and I/O orchestration at the edge only.
- Live under `src/gateway/gateway/<Domain>/<system-or-domain>/`, where `<Domain>` is `Common`, `Catalog`, `Template`, or `Theme`.

## Web Workers

- CPU-heavy work that must not block the renderer main thread is offloaded via
  `gateway/services/<Domain>/*-worker.ts` entry files instantiated by a matching
  `*-worker-service.ts`.
- Worker entry files are **pure compute boundaries**: they may import only
  worker-safe domain helper modules (`domain/utils/**` or Theme helper
  operations under `domain/operations/Theme/theme-operations/theme-utils/**`;
  no `domain/state`, `src/app`, gateways, or stores). Keep request/response
  message types colocated with the worker entry or in those helper modules when
  shared.
- Services own worker lifecycle (spawn, postMessage, terminate) and map results
  back to model types; operations enqueue work through gateways/services, not
  by importing worker entries directly.

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
