import { singleton } from 'tsyringe';
import type { Source, Token, TokenType } from '../../model/schemas';
import { parseSemanticSelector } from '../../model/semantic-token';
import { CatalogService } from './catalog-service';

const BACKTICK_RE = /`([^`]+)`/g;
const CODE_TAG_RE = /<code>([^<]+)<\/code>/gi;

/** Matches registerColor('key', ...) or registerColor("key", ...); capture group 1 = token key */
const REGISTER_COLOR_RE = /registerColor\s*\(\s*['"]([^'"]+)['"]/g;

/** Matches export * from '...' or export * from "..."; capture group 1 = path */
const EXPORT_STAR_FROM_RE = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;

/** Matches registerTokenType('id', ...) or registerTokenType("id", ...); capture group 1 = type id */
const REGISTER_TOKEN_TYPE_RE = /registerTokenType\s*\(\s*['"]([^'"]+)['"]/g;
/** Matches registerTokenModifier('id', ...) or registerTokenModifier("id", ...); capture group 1 = modifier id */
const REGISTER_TOKEN_MODIFIER_RE = /registerTokenModifier\s*\(\s*['"]([^'"]+)['"]/g;
/** Matches registerTokenStyleDefault('selector', ...) or registerTokenStyleDefault("selector", ...); capture group 1 = selector */
const REGISTER_TOKEN_STYLE_DEFAULT_RE = /registerTokenStyleDefault\s*\(\s*['"]([^'"]+)['"]/g;

const THEME_ONLY_SOURCE_TYPES = ['color-registry', 'color-registry-set'] as const;
const SEMANTIC_ONLY_SOURCE_TYPES = ['semantic-token-registry'] as const;
const TEXTMATE_ONLY_SOURCE_TYPES = ['textmate-xml', 'textmate-json'] as const;

/** Plist XML: <key>scopeName</key><string>...</string>; capture group 1 = scope */
const TMLANGUAGE_SCOPE_NAME_RE = /<key>scopeName<\/key>\s*<string>([^<]+)<\/string>/;
/** Plist XML: <key>name</key><string>...</string>; capture group 1 = scope */
const TMLANGUAGE_NAME_RE = /<key>name<\/key>\s*<string>([^<]+)<\/string>/g;

/** Theme color IDs: optional segments after first (e.g. "foreground" or "icon.foreground") */
const THEME_COLOR_RE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;
const TEXTMATE_SCOPE_RE = /^([a-zA-Z][a-zA-Z0-9_-]*|\*)(\.([a-zA-Z][a-zA-Z0-9_-]*|\*))+$/;

function isValidSemanticSelector(candidate: string): boolean {
  try {
    const parsed = parseSemanticSelector(candidate);
    if (parsed.type.length === 0) return false;
    // VS Code semantic types are camelCase (or *); reject type starting with uppercase
    if (parsed.type !== '*' && parsed.type[0] !== parsed.type[0].toLowerCase()) return false;
    return true;
  } catch {
    return false;
  }
}

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
      return isValidSemanticSelector(candidate);
    case 'textmate token':
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
  return unique.map((key) => ({ key, type: tokenType }));
}

function parseTextmateGrammarSource(xmlText: string): Token[] {
  const scopes = new Set<string>();
  const scopeNameMatch = xmlText.match(TMLANGUAGE_SCOPE_NAME_RE);
  if (scopeNameMatch) {
    const s = scopeNameMatch[1].trim();
    if (s) scopes.add(s);
  }
  let match: RegExpExecArray | null;
  const nameRe = new RegExp(TMLANGUAGE_NAME_RE.source, 'g');
  while ((match = nameRe.exec(xmlText)) !== null) {
    const s = match[1].trim();
    if (s) scopes.add(s);
  }
  const filtered = [...scopes].filter((scope) => filterByTokenType(scope, 'textmate token'));
  const unique = [...new Set(filtered)].sort();
  return unique.map((key) => ({ key, type: 'textmate token' }));
}

/** Recursively collect scope names from .tmLanguage.json: "scopeName" and all "name" string values */
function collectScopeNamesFromJson(obj: unknown, scopes: Set<string>): void {
  if (obj === null || typeof obj !== 'object') return;
  const o = obj as Record<string, unknown>;
  if (typeof o.scopeName === 'string') {
    const s = o.scopeName.trim();
    if (s) scopes.add(s);
  }
  if (typeof o.name === 'string') {
    const s = o.name.trim();
    if (s) scopes.add(s);
  }
  for (const key of Object.keys(o)) {
    const v = o[key];
    if (Array.isArray(v)) {
      for (const item of v) collectScopeNamesFromJson(item, scopes);
    } else if (v !== null && typeof v === 'object') {
      collectScopeNamesFromJson(v, scopes);
    }
  }
}

function parseTextmateJsonSource(jsonText: string): Token[] {
  const scopes = new Set<string>();
  try {
    const data = JSON.parse(jsonText) as unknown;
    collectScopeNamesFromJson(data, scopes);
  } catch {
    return [];
  }
  const filtered = [...scopes].filter((scope) => filterByTokenType(scope, 'textmate token'));
  const unique = [...new Set(filtered)].sort();
  return unique.map((key) => ({ key, type: 'textmate token' }));
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

export type SemanticRegistryParseResult = {
  types: string[];
  modifiers: string[];
  languages: string[];
};

function parseSemanticTokenRegistrySource(text: string): SemanticRegistryParseResult {
  const types = new Set<string>();
  const modifiers = new Set<string>();
  const languages = new Set<string>();

  let match: RegExpExecArray | null;
  const typeRe = new RegExp(REGISTER_TOKEN_TYPE_RE.source, 'g');
  while ((match = typeRe.exec(text)) !== null) {
    const id = match[1].trim();
    if (id) types.add(id);
  }

  const modifierRe = new RegExp(REGISTER_TOKEN_MODIFIER_RE.source, 'g');
  while ((match = modifierRe.exec(text)) !== null) {
    const id = match[1].trim();
    if (id) modifiers.add(id);
  }

  const styleDefaultRe = new RegExp(REGISTER_TOKEN_STYLE_DEFAULT_RE.source, 'g');
  while ((match = styleDefaultRe.exec(text)) !== null) {
    const selector = match[1].trim();
    if (!selector) continue;
    try {
      const parsed = parseSemanticSelector(selector);
      if (parsed.type && parsed.type !== '*') types.add(parsed.type);
      for (const m of parsed.modifiers) modifiers.add(m);
      if (parsed.language) languages.add(parsed.language);
    } catch {
      // skip invalid selector
    }
  }

  return {
    types: [...types].sort(),
    modifiers: [...modifiers].sort(),
    languages: [...languages].sort(),
  };
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
): Promise<SyncCatalogResult> {
  const allTokens: Token[] = [];
  let registryTypes: string[] = [];
  let registryModifiers: string[] = [];
  let registryLanguages: string[] = [];

  for (const source of sources) {
    if (
      THEME_ONLY_SOURCE_TYPES.includes(source.type as (typeof THEME_ONLY_SOURCE_TYPES)[number]) &&
      source.tokenType !== 'theme'
    ) {
      throw new Error('color-registry and color-registry-set require tokenType theme');
    }
    if (
      SEMANTIC_ONLY_SOURCE_TYPES.includes(source.type as (typeof SEMANTIC_ONLY_SOURCE_TYPES)[number]) &&
      source.tokenType !== 'semantic token'
    ) {
      throw new Error('semantic-token-registry requires tokenType semantic token');
    }
    if (
      TEXTMATE_ONLY_SOURCE_TYPES.includes(source.type as (typeof TEXTMATE_ONLY_SOURCE_TYPES)[number]) &&
      source.tokenType !== 'textmate token'
    ) {
      throw new Error('textmate-xml and textmate-json require tokenType textmate token');
    }

    switch (source.type) {
      case 'default': {
        const text = await fetchText(source.url);
        const tokens = parseDefaultSource(text, source.tokenType);
        allTokens.push(...tokens);
        break;
      }
      case 'color-registry': {
        const text = await fetchText(source.url);
        const tokens = parseColorRegistrySource(text, source.tokenType);
        allTokens.push(...tokens);
        break;
      }
      case 'color-registry-set': {
        const manifestText = await fetchText(source.url);
        const paths = parseExportStarFromPaths(manifestText);
        const urls = [...new Set(paths.map((p) => resolveExportUrl(p, source.url)))];
        for (const url of urls) {
          const text = await fetchText(url);
          const tokens = parseColorRegistrySource(text, 'theme');
          allTokens.push(...tokens);
        }
        break;
      }
      case 'semantic-token-registry': {
        const text = await fetchText(source.url);
        const parsed = parseSemanticTokenRegistrySource(text);
        registryTypes = [...new Set([...registryTypes, ...parsed.types])].sort();
        registryModifiers = [...new Set([...registryModifiers, ...parsed.modifiers])].sort();
        registryLanguages = [...new Set([...registryLanguages, ...parsed.languages])].sort();
        break;
      }
      case 'textmate-xml': {
        const text = await fetchText(source.url);
        const tokens = parseTextmateGrammarSource(text);
        allTokens.push(...tokens);
        break;
      }
      case 'textmate-json': {
        const text = await fetchText(source.url);
        const tokens = parseTextmateJsonSource(text);
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

  const sortedTokens = deduped.sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) return typeCmp;
    return a.key.localeCompare(b.key);
  });

  const semanticTokens = sortedTokens.filter((t) => t.type === 'semantic token');
  const semanticTokenTypes: string[] = [];
  const semanticTokenModifiers: string[] = [];
  const semanticTokenLanguages: string[] = [];
  for (const t of semanticTokens) {
    try {
      const parsed = parseSemanticSelector(t.key);
      if (parsed.type !== '*') {
        semanticTokenTypes.push(parsed.type);
      }
      semanticTokenModifiers.push(...parsed.modifiers);
      if (parsed.language) {
        semanticTokenLanguages.push(parsed.language);
      }
    } catch {
      // skip invalid keys
    }
  }
  let types = [...new Set(semanticTokenTypes)].sort();
  let modifiers = [...new Set(semanticTokenModifiers)].sort();
  let languages = [...new Set(semanticTokenLanguages)].sort();

  types = [...new Set([...types, ...registryTypes])].sort();
  modifiers = [...new Set([...modifiers, ...registryModifiers])].sort();
  languages = [...new Set([...languages, ...registryLanguages])].sort();

  return {
    tokens: sortedTokens,
    semanticTokenTypes: types,
    semanticTokenModifiers: modifiers,
    semanticTokenLanguages: languages,
  };
}

export type SyncCatalogResult = {
  tokens: Token[];
  semanticTokenTypes: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
};

@singleton()
export class CatalogSyncService {
  constructor(private readonly catalogService: CatalogService) {}

  async sync(sources: readonly Source[]): Promise<SyncCatalogResult> {
    return syncCatalogTokens(sources, (url) => this.catalogService.fetchUrl(url));
  }
}
