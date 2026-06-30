---
name: modify-gateway
description: Gateway facade patterns, role in converting wire data to domain models, and boundaries. Use when authoring, modifying, or interacting with gateways
---

# Gateway (concept)

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When you change gateway class/file naming here, update that `describe` and vice versa.**

## Role

- Facade over **services**: convert **wire/raw** data ↔ **domain models** (e.g. JSON → zod parse).
- **No** business logic; system-edge concerns (shape, defaults, errors from I/O) only.

## DI

- **`@singleton()`**; inject concrete **services** and other infra — no string or symbol tokens; not React.

## Callers

- **Operations** (preferred). Not handlers or components.

## Good / bad

| Good | Bad |
|------|-----|
| `parseCatalogJson(raw: unknown): Catalog` | Reject save because "duplicate name" |
| Thin wrapper over `FileService` + zod | Controller calls gateway directly for writes |
