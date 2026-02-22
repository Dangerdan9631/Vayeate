# Templates

Theme template JSON files are stored in this folder.

## Versioned naming

- Template files use `id.v<version>.template.json`.
- Example: `my-template.v1.0.0.template.json`.

## Template v2 fields

- `version`: semantic version for the template version.
- `locked`: whether the version is locked.

When a locked template is modified and saved, a new incremented patch version is created and saved as unlocked.