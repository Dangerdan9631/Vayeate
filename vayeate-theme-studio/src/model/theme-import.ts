import { z } from 'zod';
import type { Token } from './schema/catalog';
import type { TokenType } from './schema/primitives';

const themeImportTokenColorEntrySchema = z.object({
  scope: z.union([z.string(), z.array(z.string())]).optional(),
}).passthrough();

export const themeImportSchema = z.object({
  colors: z.record(z.string(), z.unknown()).optional(),
  tokenColors: z.array(themeImportTokenColorEntrySchema).optional(),
  semanticTokenColors: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export type ThemeImport = z.infer<typeof themeImportSchema>;

export interface BulkParseResult {
  tokens: Token[];
  counts: Record<TokenType, number>;
}

export function parseThemeJson(text: string): BulkParseResult {
  const parsedJson: unknown = JSON.parse(text);
  const theme = themeImportSchema.parse(parsedJson);
  const tokens: Token[] = [];

  if (theme.colors) {
    for (const key of Object.keys(theme.colors)) {
      tokens.push({ key, type: 'theme' });
    }
  }

  if (theme.tokenColors) {
    for (const entry of theme.tokenColors) {
      if (!entry.scope) {
        continue;
      }
      const scopes = Array.isArray(entry.scope) ? entry.scope : [entry.scope];
      for (const scope of scopes) {
        tokens.push({ key: scope, type: 'textmate token' });
      }
    }
  }

  if (theme.semanticTokenColors) {
    for (const key of Object.keys(theme.semanticTokenColors)) {
      tokens.push({ key, type: 'semantic token' });
    }
  }

  const seen = new Set<string>();
  const deduped = tokens.filter((token) => {
    const id = `${token.type}::${token.key}`;
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });

  const counts: Record<TokenType, number> = { theme: 0, 'textmate token': 0, 'semantic token': 0 };
  for (const token of deduped) {
    counts[token.type]++;
  }

  return { tokens: deduped, counts };
}