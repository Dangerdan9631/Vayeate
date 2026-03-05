import type { Source, Token, TokenType } from '../model/schemas';
import { createLogger } from '../utils/logger';

const log = createLogger('CatalogSync');

const BACKTICK_RE = /`([^`]+)`/g;
const CODE_TAG_RE = /<code>([^<]+)<\/code>/gi;

/** Matches registerColor('key', ...) or registerColor("key", ...); capture group 1 = token key */
const REGISTER_COLOR_RE = /registerColor\s*\(\s*['"]([^'"]+)['"]/g;

/** Matches export * from '...' or export * from "..."; capture group 1 = path */
const EXPORT_STAR_FROM_RE = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;

const THEME_ONLY_SOURCE_TYPES = ['color-registry', 'color-registry-set'] as const;

/** Theme color IDs: optional segments after first (e.g. "foreground" or "icon.foreground") */
const THEME_COLOR_RE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;
const SEMANTIC_TOKEN_RE = /^[a-z][a-zA-Z]*(\.[a-z][a-zA-Z]*)*$/;
const TEXTMATE_SCOPE_RE = /^([a-zA-Z][a-zA-Z0-9_-]*|\*)(\.([a-zA-Z][a-zA-Z0-9_-]*|\*))+$/;

function filterByTokenType(candidate: string, tokenType: TokenType): boolean {
  switch (tokenType) {
    case 'theme':
      return (
        candidate.length >= 3 &&
        candidate.length <= 120 &&
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

function extractCandidates(text: string): string[] {
  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = BACKTICK_RE.exec(text)) !== null) {
    candidates.push(match[1].trim());
  }
  while ((match = CODE_TAG_RE.exec(text)) !== null) {
    candidates.push(match[1].trim());
  }
  return candidates;
}

function parseDefaultSource(text: string, tokenType: TokenType): Token[] {
  const candidates = extractCandidates(text);
  log.debug('extracted', candidates.length, 'candidate(s) from source text');

  const filtered = candidates.filter((c) => filterByTokenType(c, tokenType));

  const unique = [...new Set(filtered)].sort();
  return unique.map((key) => ({ key, type: tokenType }));
}

function parseColorRegistrySource(text: string, tokenType: TokenType): Token[] {
  const keys: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(REGISTER_COLOR_RE.source, 'g');
  while ((match = re.exec(text)) !== null) {
    const key = match[1].trim();
    if (key && filterByTokenType(key, tokenType)) {
      keys.push(key);
    }
  }
  const unique = [...new Set(keys)].sort();
  log.debug('extracted', unique.length, 'token(s) from color-registry source');
  return unique.map((key) => ({ key, type: tokenType }));
}

function parseExportStarFromPaths(manifestText: string): string[] {
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(EXPORT_STAR_FROM_RE.source, 'g');
  while ((match = re.exec(manifestText)) !== null) {
    const path = match[1].trim();
    if (path) paths.push(path);
  }
  return [...new Set(paths)];
}

function resolveExportUrl(relativePath: string, manifestUrl: string): string {
  const url = new URL(relativePath, manifestUrl).href;
  return url.replace(/\.js$/i, '.ts');
}

export type FetchText = (url: string) => Promise<string>;

async function defaultFetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

export async function syncCatalogTokens(
  sources: readonly Source[],
  fetchText: FetchText = defaultFetchText,
): Promise<Token[]> {
  log.debug('starting sync', `(${sources.length} source(s))`);
  const allTokens: Token[] = [];

  for (const source of sources) {
    if (
      THEME_ONLY_SOURCE_TYPES.includes(source.type as (typeof THEME_ONLY_SOURCE_TYPES)[number]) &&
      source.tokenType !== 'theme'
    ) {
      throw new Error('color-registry and color-registry-set require tokenType theme');
    }

    switch (source.type) {
      case 'default': {
        log.debug('fetching source', source.url, `tokenType=${source.tokenType}`);
        const text = await fetchText(source.url);
        log.debug('fetched', source.url, `(${text.length} chars)`);
        const tokens = parseDefaultSource(text, source.tokenType);
        log.debug('parsed', source.url, `→ ${tokens.length} token(s)`);
        allTokens.push(...tokens);
        break;
      }
      case 'color-registry': {
        log.debug('fetching source', source.url, `tokenType=${source.tokenType}`);
        const text = await fetchText(source.url);
        log.debug('fetched', source.url, `(${text.length} chars)`);
        const tokens = parseColorRegistrySource(text, source.tokenType);
        log.debug('parsed', source.url, `→ ${tokens.length} token(s)`);
        allTokens.push(...tokens);
        break;
      }
      case 'color-registry-set': {
        log.debug('fetching manifest', source.url);
        const manifestText = await fetchText(source.url);
        const paths = parseExportStarFromPaths(manifestText);
        log.debug('manifest exports', paths.length, 'path(s)');
        const urls = [...new Set(paths.map((p) => resolveExportUrl(p, source.url)))];
        for (const url of urls) {
          const text = await fetchText(url);
          const tokens = parseColorRegistrySource(text, 'theme');
          log.debug('parsed', url, `→ ${tokens.length} token(s)`);
          allTokens.push(...tokens);
        }
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

  const duplicateCount = allTokens.length - deduped.length;
  if (duplicateCount > 0) {
    log.debug('deduplication removed', duplicateCount, 'duplicate(s)');
  }

  log.debug('sync complete', `→ ${deduped.length} unique token(s)`);

  return deduped.sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) return typeCmp;
    return a.key.localeCompare(b.key);
  });
}
