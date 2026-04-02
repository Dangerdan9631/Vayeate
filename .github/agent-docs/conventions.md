# Conventions Reference

## Change scope conventions

- Implement new tool behavior under `vayeate-theme-studio/`.
- Keep root extension packaging flow unchanged unless explicitly requested.
- Make focused changes; avoid unrelated cleanup.

## Style conventions

- Follow existing TypeScript style in nearby files.
- Use explicit types for domain-critical structures.
- Keep generation and serialization deterministic.

## Handler conventions

- Action routing lives in `app/actions/` (`*-handler.ts` + `handler-registry.ts`). **Never add business logic to handlers** — they route to controllers only.
- Each domain has one handler file: `app-handler.ts`, `catalog-handler.ts`, `template-handler.ts`, `theme-handler.ts`.
- Each handler uses an exhaustive `switch` on its domain-scoped action subset (e.g. `CatalogAction`). TypeScript will error if a case is missing.
- `handler-registry.ts` exports the `@singleton()` `ActionProcessor` class; `process(action)` routes by action type prefix to the correct handler.
- `AppContext.tsx` is a lean provider; it must not contain action processor switch cases.

## Action naming conventions

- Use `<CONTEXT>_<SUBCONTEXT>_<IDENTIFIER>_<CONTROL>_<ACTION>` format (e.g. `CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK`).
- **One action = one behavior** — do not use optional fields to branch to different behaviors within one action type. Split overloaded actions into distinct action types.
- All user-triggered events must flow through the action queue. No component-owned side effects.

## Controller/operation boundary conventions

- Controllers must compose operations and validations only. Never import from `gateway/services/` or `gateway/data/` inside a controller.
- When a controller needs a service call, extract or reuse an operation in `domain/operations/<domain>-operations/`.
- Shared helper flows used by multiple files in the same controller domain belong in `<domain>-controller/shared-flows.ts`.
- Controller functions are named by the action performed (e.g. `saveCatalog`), not by the UI event (e.g. `handleSaveButtonOnClick`).
- Controller and operation files are organized into subdirectories aligned to the UI card they serve. The subdirectory name must match the card (e.g. `theme-list/` → ThemesCard, `palette/` → ThemePaletteCard). Each subdirectory exports via its own `index.ts`; the domain barrel re-exports everything. Only `shared-flows.ts`, the test file, and the root `index.ts` remain at the controller domain root.

## Form state conventions

- Form inputs that produce dispatched actions must be backed by `AppState`, not component-local `useState`.
- Use the appropriate state slice (`CatalogsState`, `TemplatesState`, `ThemesState`) for the form field.
- Add corresponding `AppStateUpdate` cases in `reducer.ts` and operations to set them.

## Testing conventions

- Add tests when generation/parity/catalog rules change.
- Prefer specific unit tests near changed logic before broad checks.
- Architecture boundaries are enforced by ts-arch tests in `vayeate-theme-studio/test/`; update them when the architecture changes.
- Validate with:
  - `npm run test`
  - `npm run build`

## Documentation conventions

- Update docs when behavior or workflows change.
- Keep agent docs in `.github/agent-docs/` and route from `AGENTS.md`.
- Keep Copilot-facing instructions in `.github/copilot-instructions.md`.
