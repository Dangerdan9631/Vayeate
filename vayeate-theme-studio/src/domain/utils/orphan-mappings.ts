import type { Catalog, Mapping, Template, Token, TokenType } from '../../model/schemas';
import { parseSemanticSelector, SEMANTIC_WILDCARD_TYPE } from './semantic-token';

export interface SemanticCatalogInfo {
  semanticTokenTypes: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
}

export function computeOrphanKeys(
  mappings: readonly Mapping[],
  catalogTokens: readonly Token[],
  semanticCatalog?: SemanticCatalogInfo,
): Set<string> {
  const catalogKeys = new Set(catalogTokens.map((t) => `${t.type}::${t.key}`));
  const typesSet = semanticCatalog ? new Set(semanticCatalog.semanticTokenTypes) : null;
  const modifiersSet = semanticCatalog ? new Set(semanticCatalog.semanticTokenModifiers) : null;
  const languagesSet = semanticCatalog ? new Set(semanticCatalog.semanticTokenLanguages) : null;

  const orphans = new Set<string>();
  for (const m of mappings) {
    const key = `${m.token.type}::${m.token.key}`;
    if (catalogKeys.has(key)) continue;
    if (m.token.type === 'semantic token' && typesSet && modifiersSet && languagesSet) {
      try {
        const parsed = parseSemanticSelector(m.token.key);
        const typeOk = parsed.type === SEMANTIC_WILDCARD_TYPE || typesSet.has(parsed.type);
        const modOk = parsed.modifiers.every((mod) => modifiersSet.has(mod));
        const langOk = !parsed.language || languagesSet.has(parsed.language);
        if (typeOk && modOk && langOk) continue;
      } catch {
        // invalid selector → orphan
      }
    }
    orphans.add(key);
  }
  return orphans;
}

/**
 * Matches template mappings-card orphan UX: no refs ⇒ not orphan; missing catalog snapshots ⇒ not orphan (conservative).
 */
export function isMappingOrphanForTemplate(
  template: Template,
  tokenKey: string,
  tokenType: TokenType,
  loadedForDisplay: Record<string, Catalog>,
): boolean {
  if (template.catalogRefs.length === 0) return false;

  const loaded = template.catalogRefs.map((ref) => {
    const key = `${ref.name}@${ref.version}`;
    return loadedForDisplay[key] ?? null;
  });
  if (!loaded.every((c): c is Catalog => c !== null)) return false;

  const allTokens: Token[] = [];
  const typesSet = new Set<string>();
  const modifiersSet = new Set<string>();
  const languagesSet = new Set<string>();
  for (const catalog of loaded) {
    allTokens.push(...catalog.tokens);
    (catalog.semanticTokenTypes ?? []).forEach((t: string) => typesSet.add(t));
    (catalog.semanticTokenModifiers ?? []).forEach((m: string) => modifiersSet.add(m));
    (catalog.semanticTokenLanguages ?? []).forEach((l: string) => languagesSet.add(l));
  }
  const semanticCatalog: SemanticCatalogInfo | undefined =
    typesSet.size > 0 || modifiersSet.size > 0 || languagesSet.size > 0
      ? {
          semanticTokenTypes: [...typesSet].sort(),
          semanticTokenModifiers: [...modifiersSet].sort(),
          semanticTokenLanguages: [...languagesSet].sort(),
        }
      : undefined;
  const orphans = computeOrphanKeys(template.mappings, allTokens, semanticCatalog);
  return orphans.has(`${tokenType}::${tokenKey}`);
}
