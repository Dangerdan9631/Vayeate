import type { Token } from '../../model/schema/catalog';
import type { TokenType } from '../../model/schema/primitives';

interface ThemeJson {
  colors?: Record<string, unknown>;
  tokenColors?: unknown[];
  semanticTokenColors?: Record<string, unknown>;
}

interface TokenColorEntry {
  scope?: string | string[];
}

function isTokenColorEntry(value: unknown): value is TokenColorEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    !('scope' in entry) ||
    typeof entry.scope === 'string' ||
    (Array.isArray(entry.scope) && entry.scope.every((s) => typeof s === 'string'))
  );
}

export interface BulkParseResult {
  tokens: Token[];
  counts: Record<TokenType, number>;
}

export function parseThemeJson(text: string): BulkParseResult {
  const json: unknown = JSON.parse(text);
  if (typeof json !== 'object' || json === null) {
    throw new Error('Expected a JSON object');
  }

  const theme = json as ThemeJson;
  const tokens: Token[] = [];

  if (theme.colors && typeof theme.colors === 'object') {
    for (const key of Object.keys(theme.colors)) {
      tokens.push({ key, type: 'theme' });
    }
  }

  if (Array.isArray(theme.tokenColors)) {
    for (const entry of theme.tokenColors) {
      if (!isTokenColorEntry(entry)) continue;
      if (!entry.scope) continue;
      const scopes = Array.isArray(entry.scope) ? entry.scope : [entry.scope];
      for (const scope of scopes) {
        tokens.push({ key: scope, type: 'textmate token' });
      }
    }
  }

  if (theme.semanticTokenColors && typeof theme.semanticTokenColors === 'object') {
    for (const key of Object.keys(theme.semanticTokenColors)) {
      tokens.push({ key, type: 'semantic token' });
    }
  }

  const seen = new Set<string>();
  const deduped = tokens.filter((t) => {
    const id = `${t.type}::${t.key}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const counts: Record<TokenType, number> = { theme: 0, 'textmate token': 0, 'semantic token': 0 };
  for (const t of deduped) {
    counts[t.type]++;
  }

  return { tokens: deduped, counts };
}
