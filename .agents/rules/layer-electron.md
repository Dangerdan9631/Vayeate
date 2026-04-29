---
activation: model
description: Use when authoring, modifing, or interacting with Electron files
---

# Layer: electron

## Rules

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts) — `describe('electron/*.ts: no imports from renderer src/')` ensures Electron sources do not import the renderer `src/` tree.

- **No business logic.** `electron/` may contain OS/Electron APIs, window lifecycle code, IPC wiring, preload surface definition, and Electron-only support helpers such as path/bootstrap or log-forwarding modules.
- **All renderer IPC** from the app goes through a **service**; that service is reached via **gateway** or **operation** (not ad-hoc `ipcRenderer` scattered in domain).

## Good / bad

```ts
// BAD — domain rules in main
if (catalog.isDirty) { /* ... */ }

// GOOD — main forwards invoke/handle; validation in renderer domain
ipcMain.handle('read-file', (_, path) => fs.promises.readFile(path, 'utf8'));
```