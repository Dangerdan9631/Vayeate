import type { Source, Token } from '../../model/schema/catalog';
import type { TokenType } from '../../model/schema/primitives';
import { parseSemanticSelector } from '../../model/parse-semantic-selector';

const BACKTICK_RE = /`([^`]+)`/g;
const CODE_TAG_RE = /<code>([^<]+)<\/code>/gi;
const REGISTER_COLOR_RE = /registerColor\s*\(\s*['"]([^'"]+)['"]/g;
const EXPORT_STAR_FROM_RE = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;
const REGISTER_TOKEN_TYPE_RE = /registerTokenType\s*\(\s*['"]([^'"]+)['"]/g;
const REGISTER_TOKEN_MODIFIER_RE = /registerTokenModifier\s*\(\s*['"]([^'"]+)['"]/g;
const REGISTER_TOKEN_STYLE_DEFAULT_RE = /registerTokenStyleDefault\s*\(\s*['"]([^'"]+)['"]/g;
const THEME_ONLY_SOURCE_TYPES = ['color-registry', 'color-registry-set'] as const;
const SEMANTIC_ONLY_SOURCE_TYPES = ['semantic-token-registry'] as const;
const TEXTMATE_ONLY_SOURCE_TYPES = ['textmate-xml', 'textmate-json'] as const;
const TMLANGUAGE_SCOPE_NAME_RE = /<key>scopeName<\/key>\s*<string>([^<]+)<\/string>/;
const TMLANGUAGE_NAME_RE = /<key>name<\/key>\s*<string>([^<]+)<\/string>/g;
const THEME_COLOR_RE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;
const TEXTMATE_SCOPE_RE = /^([a-zA-Z][a-zA-Z0-9_-]*|\*)(\.([a-zA-Z][a-zA-Z0-9_-]*|\*))+$/;

type SourceTextByUrl = Readonly<Record<string, string>>;

export type SyncCatalogResult = {
  tokens: Token[];
  semanticTokenTypes: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
};

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
  const filtered = extractCandidates(text).filter((candidate) => filterByTokenType(candidate, tokenType));
  return [...new Set(filtered)].sort().map((key) => ({ key, type: tokenType }));
}

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

export function resolveExportUrl(relativePath: string, manifestUrl: string): string {
  return new URL(relativePath, manifestUrl).href.replace(/\.js$/i, '.ts');
}

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
