# Preview gateway

Loads syntax-highlight previews for the theme editor by scanning bundled sample files under `previews/` and tokenizing them with TextMate grammars.

## Modules

| File | Role |
|------|------|
| `preview-gateway.ts` | Discovers language folders, loads `*.tmLanguage.json` grammars and sample sources, returns `TokenizedPreview[]`. |

## Call flow

```
Operation → PreviewGateway → FileSystemService (grammars + samples)
                          → TextmateTokenizerService (Oniguruma + vscode-textmate)
```

## Boundaries

- **In scope:** preview directory layout, grammar loading, WASM init for tokenization, structured preview output.
- **Out of scope:** theme color application, preview UI — see `src/app/theme/` and `src/domain/` preview types.

For gateway-layer conventions see the parent [README](../README.md).
