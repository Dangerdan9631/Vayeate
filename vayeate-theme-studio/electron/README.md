# N

Electron main-process and preload code. Keep business logic out of this layer.

## Placement

- Path: `electron`
- Layer: Electron layer

## Contents

- Subfolders: None
- Files: `ipc-handlers.ts`, `log-forwarding.ts`, `main-window.ts`, `main.ts`, `paths.ts`, `preload.ts`, `theme-preview-host.ts`

## Rules

- Keep Electron main, preload, and IPC wiring here.
- Do not place renderer UI or business rules in Electron code.
- Use typed IPC/service boundaries to reach renderer-facing behavior.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

