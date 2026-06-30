import type { Source, Token } from '../../model/schema/catalog';
import type { TokenType } from '../../model/schema/primitives';
import { parseSemanticSelector } from '../../model/parse-semantic-selector';

/**
 * Matches backtick-wrapped token candidates in default source text.
 */
const BACKTICK_RE = /`([^`]+)`/g;
/**
 * Matches `<code>` tag contents in default source text.
 */
const CODE_TAG_RE = /<code>([^<]+)<\/code>/gi;
/**
 * Matches `registerColor('id')` calls in color registry TypeScript.
 */
const REGISTER_COLOR_RE = /registerColor\s*\(\s*['"]([^'"]+)['"]/g;
/** Matches `export * from 'path'` re-exports in registry set manifests. */
const EXPORT_STAR_FROM_RE = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;
/**
 * Matches `registerTokenType('id')` in semantic token registry sources.
 */
const REGISTER_TOKEN_TYPE_RE = /registerTokenType\s*\(\s*['"]([^'"]+)['"]/g;
/**
 * Matches `registerTokenModifier('id')` in semantic token registry sources.
 */
const REGISTER_TOKEN_MODIFIER_RE = /registerTokenModifier\s*\(\s*['"]([^'"]+)['"]/g;
/**
 * Matches `registerTokenStyleDefault('selector')` in semantic token registry sources.
 */
const REGISTER_TOKEN_STYLE_DEFAULT_RE = /registerTokenStyleDefault\s*\(\s*['"]([^'"]+)['"]/g;
/**
 * Source types that must use theme token type when syncing.
 */
const THEME_ONLY_SOURCE_TYPES = ['color-registry', 'color-registry-set'] as const;
/**
 * Source types that must use semantic token type when syncing.
 */
const SEMANTIC_ONLY_SOURCE_TYPES = ['semantic-token-registry'] as const;
/**
 * Source types that must use textmate token type when syncing.
 */
const TEXTMATE_ONLY_SOURCE_TYPES = ['textmate-xml', 'textmate-json'] as const;
/**
 * Extracts root `scopeName` from a TextMate plist grammar.
 */
const TMLANGUAGE_SCOPE_NAME_RE = /<key>scopeName<\/key>\s*<string>([^<]+)<\/string>/;
/**
 * Extracts rule `name` scope strings from a TextMate plist grammar.
 */
const TMLANGUAGE_NAME_RE = /<key>name<\/key>\s*<string>([^<]+)<\/string>/g;
/**
 * Validates dot-separated theme color identifiers.
 */
const THEME_COLOR_RE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;
/**
 * Validates TextMate scope selector strings.
 */
const TEXTMATE_SCOPE_RE = /^([a-zA-Z][a-zA-Z0-9_-]*|\*)(\.([a-zA-Z][a-zA-Z0-9_-]*|\*))+$/;

/**
 * Fetched source body keyed by absolute URL.
 */
type SourceTextByUrl = Readonly<Record<string, string>>;

/**
 * Parsed token list and semantic registry metadata from a catalog sync.
 */
export type SyncCatalogResult = {
  tokens: Token[];
  semanticTokenTypes: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
};

/**
 * Returns whether a string parses as a valid semantic token selector.
 *
 * @param candidate - Raw selector text from a source.
 * @returns True when the selector parses and type rules pass.
 */
function isValidSemanticSelector(candidate: string): boolean {
  try {
    const parsed = parseSemanticSelector(candidate);
    if (parsed.type.length === 0) {
      return false;
    }
    return parsed.type === '*' || parsed.type[0] === parsed.type[0].toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Applies token-type-specific shape rules to a candidate key.
 *
 * @param candidate - Token key extracted from source text.
 * @param tokenType - Expected catalog token type for the source.
 * @returns True when the candidate matches that type's constraints.
 */
function filterByTokenType(candidate: string, tokenType: TokenType): boolean {
  switch (tokenType) {
    case 'theme':
      return candidate.length >= 3
        && candidate.length <= 120
        && !/\s/.test(candidate)
        && THEME_COLOR_RE.test(candidate);
    case 'semantic token':
      return isValidSemanticSelector(candidate);
    case 'textmate token':
      return candidate.length >= 3
        && candidate.length <= 160
        && candidate.includes('.')
        && !/\s/.test(candidate)
        && TEXTMATE_SCOPE_RE.test(candidate);
  }
}

/**
 * Pulls token key candidates from backticks and `<code>` tags in markdown-like text.
 *
 * @param text - Default source body.
 * @returns Trimmed candidate strings in discovery order.
 */
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

/**
 * Builds tokens from markdown-style default sources.
 *
 * @param text - Default source body.
 * @param tokenType - Token type declared on the source.
 * @returns Deduped, sorted tokens passing type filters.
 */
function parseDefaultSource(text: string, tokenType: TokenType): Token[] {
  const filtered = extractCandidates(text).filter((candidate) => filterByTokenType(candidate, tokenType));
  return [...new Set(filtered)].sort().map((key) => ({ key, type: tokenType }));
}

/**
 * Builds tokens from `registerColor` calls in registry TypeScript.
 *
 * @param text - Color registry source body.
 * @param tokenType - Token type declared on the source.
 * @returns Deduped, sorted theme tokens from registerColor ids.
 */
function parseColorRegistrySource(text: string, tokenType: TokenType): Token[] {
  const keys: string[] = [];
  let match: RegExpExecArray | null;
  const expression = new RegExp(REGISTER_COLOR_RE.source, 'g');
  while ((match = expression.exec(text)) !== null) {
    const key = match[1].trim();
    if (key && filterByTokenType(key, tokenType)) {
      keys.push(key);
    }
  }
  return [...new Set(keys)].sort().map((key) => ({ key, type: tokenType }));
}

/**
 * Builds textmate tokens from a plist TextMate grammar XML file.
 *
 * @param xmlText - Raw `.tmLanguage` XML content.
 * @returns Deduped, sorted scopes from scopeName and rule names.
 */
function parseTextmateGrammarSource(xmlText: string): Token[] {
  const scopes = new Set<string>();
  const scopeNameMatch = xmlText.match(TMLANGUAGE_SCOPE_NAME_RE);
  if (scopeNameMatch) {
    const scope = scopeNameMatch[1].trim();
    if (scope) {
      scopes.add(scope);
    }
  }

  let match: RegExpExecArray | null;
  const expression = new RegExp(TMLANGUAGE_NAME_RE.source, 'g');
  while ((match = expression.exec(xmlText)) !== null) {
    const scope = match[1].trim();
    if (scope) {
      scopes.add(scope);
    }
  }

  return [...new Set([...scopes].filter((scope) => filterByTokenType(scope, 'textmate token')))]
    .sort()
    .map((key) => ({ key, type: 'textmate token' }));
}

/**
 * Recursively collects `scopeName` and `name` fields from a grammar JSON tree.
 *
 * @param value - Current JSON node while walking the grammar.
 * @param scopes - Accumulator for discovered scope strings.
 * @returns Nothing; mutates `scopes`.
 */
function collectScopeNamesFromJson(value: unknown, scopes: Set<string>): void {
  if (value === null || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.scopeName === 'string') {
    const scopeName = record.scopeName.trim();
    if (scopeName) {
      scopes.add(scopeName);
    }
  }
  if (typeof record.name === 'string') {
    const name = record.name.trim();
    if (name) {
      scopes.add(name);
    }
  }

  for (const child of Object.values(record)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        collectScopeNamesFromJson(item, scopes);
      }
      continue;
    }
    collectScopeNamesFromJson(child, scopes);
  }
}

/**
 * Builds textmate tokens from a JSON TextMate grammar file.
 *
 * @param jsonText - Raw `.tmLanguage.json` content.
 * @returns Deduped, sorted scopes, or an empty list when JSON is invalid.
 */
function parseTextmateJsonSource(jsonText: string): Token[] {
  const scopes = new Set<string>();
  try {
    collectScopeNamesFromJson(JSON.parse(jsonText) as unknown, scopes);
  } catch {
    return [];
  }

  return [...new Set([...scopes].filter((scope) => filterByTokenType(scope, 'textmate token')))]
    .sort()
    .map((key) => ({ key, type: 'textmate token' }));
}

/**
 * Lists relative module paths from `export * from` lines in a registry set manifest.
 *
 * @param manifestText - Color registry set index TypeScript.
 * @returns Deduped relative export paths.
 */
function parseExportStarFromPaths(manifestText: string): string[] {
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  const expression = new RegExp(EXPORT_STAR_FROM_RE.source, 'g');
  while ((match = expression.exec(manifestText)) !== null) {
    const path = match[1].trim();
    if (path) {
      paths.push(path);
    }
  }
  return [...new Set(paths)];
}

/**
 * Resolves a manifest-relative export path to an absolute fetch URL.
 *
 * @param relativePath - Path from an `export * from` statement.
 * @param manifestUrl - Absolute URL of the registry set manifest.
 * @returns Absolute URL with `.js` extensions normalized to `.ts`.
 */
export function resolveExportUrl(relativePath: string, manifestUrl: string): string {
  return new URL(relativePath, manifestUrl).href.replace(/\.js$/i, '.ts');
}

/**
 * Extracts semantic types, modifiers, and languages from a VS Code semantic registry file.
 *
 * @param text - Semantic token registry TypeScript body.
 * @returns Sorted unique registry ids and languages.
 */
function parseSemanticTokenRegistrySource(text: string): { types: string[]; modifiers: string[]; languages: string[] } {
  const types = new Set<string>();
  const modifiers = new Set<string>();
  const languages = new Set<string>();

  let match: RegExpExecArray | null;
  const typeExpression = new RegExp(REGISTER_TOKEN_TYPE_RE.source, 'g');
  while ((match = typeExpression.exec(text)) !== null) {
    const id = match[1].trim();
    if (id) {
      types.add(id);
    }
  }

  const modifierExpression = new RegExp(REGISTER_TOKEN_MODIFIER_RE.source, 'g');
  while ((match = modifierExpression.exec(text)) !== null) {
    const id = match[1].trim();
    if (id) {
      modifiers.add(id);
    }
  }

  const styleDefaultExpression = new RegExp(REGISTER_TOKEN_STYLE_DEFAULT_RE.source, 'g');
  while ((match = styleDefaultExpression.exec(text)) !== null) {
    const selector = match[1].trim();
    if (!selector) {
      continue;
    }
    try {
      const parsed = parseSemanticSelector(selector);
      if (parsed.type && parsed.type !== '*') {
        types.add(parsed.type);
      }
      for (const modifier of parsed.modifiers) {
        modifiers.add(modifier);
      }
      if (parsed.language) {
        languages.add(parsed.language);
      }
    } catch {
      // Ignore invalid selectors in source registries.
    }
  }

  return {
    types: [...types].sort(),
    modifiers: [...modifiers].sort(),
    languages: [...languages].sort(),
  };
}

/**
 * Converts fetched catalog sources into deduped tokens and semantic registry metadata.
 *
 * @param sources - Catalog source descriptors in sync order.
 * @param sourceTextByUrl - Response bodies keyed by each source URL.
 * @returns Merged tokens plus semantic type, modifier, and language lists.
 */
export function parseSyncedCatalogTokens(
  sources: readonly Source[],
  sourceTextByUrl: SourceTextByUrl,
): SyncCatalogResult {
  const allTokens: Token[] = [];
  let registryTypes: string[] = [];
  let registryModifiers: string[] = [];
  let registryLanguages: string[] = [];

  for (const source of sources) {
    if (THEME_ONLY_SOURCE_TYPES.includes(source.type as (typeof THEME_ONLY_SOURCE_TYPES)[number]) && source.tokenType !== 'theme') {
      throw new Error('color-registry and color-registry-set require tokenType theme');
    }
    if (SEMANTIC_ONLY_SOURCE_TYPES.includes(source.type as (typeof SEMANTIC_ONLY_SOURCE_TYPES)[number]) && source.tokenType !== 'semantic token') {
      throw new Error('semantic-token-registry requires tokenType semantic token');
    }
    if (TEXTMATE_ONLY_SOURCE_TYPES.includes(source.type as (typeof TEXTMATE_ONLY_SOURCE_TYPES)[number]) && source.tokenType !== 'textmate token') {
      throw new Error('textmate-xml and textmate-json require tokenType textmate token');
    }

    const sourceText = sourceTextByUrl[source.url];
    if (sourceText === undefined) {
      throw new Error(`Missing source text for ${source.url}`);
    }

    switch (source.type) {
      case 'default':
        allTokens.push(...parseDefaultSource(sourceText, source.tokenType));
        break;
      case 'color-registry':
        allTokens.push(...parseColorRegistrySource(sourceText, source.tokenType));
        break;
      case 'color-registry-set': {
        const paths = parseExportStarFromPaths(sourceText);
        const urls = [...new Set(paths.map((path) => resolveExportUrl(path, source.url)))];
        for (const url of urls) {
          const exportText = sourceTextByUrl[url];
          if (exportText === undefined) {
            throw new Error(`Missing source text for ${url}`);
          }
          allTokens.push(...parseColorRegistrySource(exportText, 'theme'));
        }
        break;
      }
      case 'semantic-token-registry': {
        const parsed = parseSemanticTokenRegistrySource(sourceText);
        registryTypes = [...new Set([...registryTypes, ...parsed.types])].sort();
        registryModifiers = [...new Set([...registryModifiers, ...parsed.modifiers])].sort();
        registryLanguages = [...new Set([...registryLanguages, ...parsed.languages])].sort();
        break;
      }
      case 'textmate-xml':
        allTokens.push(...parseTextmateGrammarSource(sourceText));
        break;
      case 'textmate-json':
        allTokens.push(...parseTextmateJsonSource(sourceText));
        break;
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  const seen = new Set<string>();
  const sortedTokens = allTokens
    .filter((token) => {
      const key = `${token.type}::${token.key}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((left, right) => {
      const typeComparison = left.type.localeCompare(right.type);
      if (typeComparison !== 0) {
        return typeComparison;
      }
      return left.key.localeCompare(right.key);
    });

  const semanticTokenTypes: string[] = [];
  const semanticTokenModifiers: string[] = [];
  const semanticTokenLanguages: string[] = [];
  for (const token of sortedTokens.filter((entry) => entry.type === 'semantic token')) {
    try {
      const parsed = parseSemanticSelector(token.key);
      if (parsed.type !== '*') {
        semanticTokenTypes.push(parsed.type);
      }
      semanticTokenModifiers.push(...parsed.modifiers);
      if (parsed.language) {
        semanticTokenLanguages.push(parsed.language);
      }
    } catch {
      // Ignore invalid semantic keys already stored in catalogs.
    }
  }

  return {
    tokens: sortedTokens,
    semanticTokenTypes: [...new Set([...semanticTokenTypes, ...registryTypes])].sort(),
    semanticTokenModifiers: [...new Set([...semanticTokenModifiers, ...registryModifiers])].sort(),
    semanticTokenLanguages: [...new Set([...semanticTokenLanguages, ...registryLanguages])].sort(),
  };
}
