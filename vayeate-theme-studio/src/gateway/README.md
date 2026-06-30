# Gateway layer

The gateway layer is the application boundary to the outside world. It performs **system integration** and **data conversion** — not business rules. Domain operations call into this layer when they need I/O, platform APIs, or wire-format translation.

## Responsibilities

| Concern | Owner | Role |
|---------|-------|------|
| System calls | **Services** | Talk to filesystem, Electron IPC, windows, web APIs, logging, screenshots, and other platform or runtime facilities. |
| Wire ↔ model | **Gateways** | Facades over services: read/write bytes or IPC payloads, parse and serialize JSON, map results to **zod-validated domain models**. |
| Heavy compute | **Web workers** | CPU-bound work off the renderer main thread. Worker entry files are pure compute boundaries; matching services own spawn, messaging, and teardown. |

Business validity — whether a catalog may be published, a name is duplicate, or an edit is allowed — belongs in **domain operations and validations**, not here.

## Call flow

Operations (and occasionally other gateway types) invoke gateways and services. UI components and handlers do not reach through to IPC or the filesystem directly.

```
Operation → Gateway → Service → Electron IPC / FS / API / Worker
                ↓
           Domain model (parsed)
```

Gateways may orchestrate multiple service calls for a single persistence or sync task, but only at the **I/O and shape** level — path conventions, serialization, debounced writes, token sync, and similar edge concerns.

## Design constraints

- **No domain rules.** Services translate platform errors; gateways enforce wire shape and defaults. Neither layer decides business outcomes.
- **`@singleton()` DI.** Gateway and service classes inject concrete dependencies — no string or symbol tokens.
- **Workers stay isolated.** Worker entries import only from `domain/utils/**`; lifecycle and model mapping live in the service that owns the worker.

## Organization

Concept folders group gateways by the external resource they front (catalog, theme, template, undo, config, preview). Shared platform integration lives under `services/`. Feature-specific conversion helpers may sit beside their gateway when they are not reused elsewhere.
