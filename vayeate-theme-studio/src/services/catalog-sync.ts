import type { Source, Token, TokenType } from '../model/schemas';

const BACKTICK_RE = /`([^`]+)`/g;

const THEME_COLOR_RE = /^[a-zA-Z0-9.-]+$/;
const SEMANTIC_TOKEN_RE = /^[a-z][a-zA-Z]*(\.[a-z][a-zA-Z]*)*$/;
const TEXTMATE_SCOPE_RE = /^[a-zA-Z0-9._*-]+$/;

function filterByTokenType(candidate: string, tokenType: TokenType): boolean {
  switch (tokenType) {
    case 'theme':
      return (
        candidate.length >= 3 &&
        candidate.length <= 120 &&
        candidate.includes('.') &&
        !/\s/.test(candidate) &&
        THEME_COLOR_RE.test(candidate)
      );
    case 'semantic token':
      return SEMANTIC_TOKEN_RE.test(candidate);
    case 'token':
      return (
        candidate.length >= 3 &&
        candidate.length <= 160 &&
        candidate.includes('.') &&
        !/\s/.test(candidate) &&
        TEXTMATE_SCOPE_RE.test(candidate)
      );
  }
}

function parseDefaultSource(text: string, tokenType: TokenType): Token[] {
  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = BACKTICK_RE.exec(text)) !== null) {
    candidates.push(match[1].trim());
  }

  const filtered = candidates.filter((c) => filterByTokenType(c, tokenType));

  const unique = [...new Set(filtered)].sort();
  return unique.map((key) => ({ key, type: tokenType }));
}

export async function syncCatalogTokens(sources: readonly Source[]): Promise<Token[]> {
  const allTokens: Token[] = [];

  for (const source of sources) {
    switch (source.type) {
      case 'default': {
        const response = await fetch(source.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${source.url}: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        const tokens = parseDefaultSource(text, source.tokenType);
        allTokens.push(...tokens);
        break;
      }
      default:
        throw new Error(`Unsupported source type: ${(source as Source).type}`);
    }
  }

  const seen = new Set<string>();
  const deduped: Token[] = [];
  for (const token of allTokens) {
    const key = `${token.type}::${token.key}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(token);
    }
  }

  return deduped.sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) return typeCmp;
    return a.key.localeCompare(b.key);
  });
}
