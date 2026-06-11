# Gateway services

Shared platform integration for the renderer process. Services wrap Electron preload APIs, browser APIs, and web workers — no domain business rules.

## Modules

| File | Role |
|------|------|
| `file-system-service.ts` | Package-relative file create, save, load, delete, list, and directory entries via IPC. |
| `web-service.ts` | HTTP fetch through main-process `fetchUrl`. |
| `window-service.ts` | Window chrome, bounds, state events, global shortcuts, and viewport resize callbacks. |
| `textmate-tokenizer-service.ts` | Oniguruma WASM init and TextMate line tokenization for previews. |
| `screenshot-service.ts` | Full-display snapshot capture for the eyedropper overlay. |
| `screenshot-service-types.ts` | Wire types for display snapshot entries and bounds. |
| `log-service.ts` | Renderer logging with level filter; forwards to main and console. |
| `log-service-types.ts` | `LogLevel` union for log severity. |
| `clustering-service.ts` | Off-main-thread palette color clustering via `clustering-worker`. |
| `clustering-worker.ts` | Web worker entry; runs `clusterColors` per group request. |

## Call flow

```
Gateway / Operation → Service → window.electronAPI (IPC) or Worker / DOM API
```

## Boundaries

- **In scope:** IPC bridging, platform error surfacing, worker lifecycle, wire-type definitions for service payloads.
- **Out of scope:** domain validation, store updates, UI — callers remain in operations and gateways.

Worker entries import only from `domain/utils/**`; the owning service handles spawn, sequencing, and result mapping.

For gateway-layer conventions see the parent [README](../README.md).
