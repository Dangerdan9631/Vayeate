> **Apply only when:** Use when authoring, modifing, or interacting with Services

# Service

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When you change service class/file naming here, update that `describe` and vice versa.**

## Role

- **System integration**: file APIs, **IPC** to main, windows, timers, etc.
- **No** domain rules; translate platform errors to typed results where helpful.

## Placement

- Lives under **`src/gateway/services/`** (or equivalent `services` subtree).

## Callers

- **Gateways** or **operations** (per architecture); keep components free of IPC.

## DI

- **`@singleton()`**; inject **concrete types** only — no string or symbol tokens.

## Good / bad

```ts
// GOOD
async readText(path: string): Promise<string> { ... }

// BAD — business validation
async readText(path: string) {
  if (!path.endsWith('.json')) throw ...
}
```