# Validations (shared)

Cross-cutting domain predicates used before mutations or to drive UI enablement. Each class exposes a single `test(...)` that returns `boolean` or `ValidationResult` and never throws; controllers decide how to handle failure.

## Layout

| Path | Role |
|------|------|
| `validator.ts` | `Validator<T>` — runs an ordered list of validations and returns the first failure |
| `window-validations/` | Native window chrome actions (minimize, maximize, restore) from `WindowStore` snapshot |
| `theme-validations/` | Theme editor preconditions (e.g. bulk color apply to checked refs) |
| `template-validations/` | Template naming, lock state, and variable removal rules |

Domain-specific validations for catalogs and other areas live beside their concept (for example `src/domain/catalog/validations/`).

## Conventions

- Name classes **`Validate` + question** (e.g. `ValidateCanLockTemplate`).
- **`@singleton()`** via tsyringe; inject stores or getters as needed — no string tokens.
- **One `test(...)` per class** — simple predicates return `boolean`; UI-facing checks return `ValidationResult` with an error message.
- **Do not call peer validations** — compose multiple checks with `Validator<T>` when sequencing is required.
- **Controllers** run validations before operations; **viewmodels** may reuse the same classes for disabled states and messaging.

For the full validation contract and controller integration, see [.agents/skills/modify-validation/SKILL.md](../../../.agents/skills/modify-validation/SKILL.md) and the domain overview in [../README.md](../README.md).
