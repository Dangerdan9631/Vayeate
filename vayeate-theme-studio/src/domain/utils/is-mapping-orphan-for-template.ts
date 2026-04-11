import type { Catalog, Template, Token, TokenType } from '../../model/schemas';
import { computeOrphanKeys, type SemanticCatalogInfo } from './compute-orphan-keys';

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
