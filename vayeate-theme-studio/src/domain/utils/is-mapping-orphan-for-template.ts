import type { Catalog, Token } from '../../model/schema/catalog';
import type { TokenType } from '../../model/schema/primitives';
import type { Template } from '../../model/schema/template-schemas';
import { computeOrphanKeys, type SemanticCatalogInfo } from './compute-orphan-keys';

/**
 * Reports whether a mapping token is orphaned for the template mappings-card UX.
 * Returns false when catalog refs are empty or any referenced catalog snapshot is missing.
 *
 * @param template - Template whose catalog refs define the valid token universe.
 * @param tokenKey - Token key of the mapping under test.
 * @param tokenType - Token type discriminant for the mapping.
 * @param catalogs - Loaded catalog entities referenced by the template.
 * @returns True when the token is absent from loaded catalogs and semantic metadata.
 */
export function isMappingOrphanForTemplate(
  template: Template,
  tokenKey: string,
  tokenType: TokenType,
  catalogs: Catalog[],
): boolean {
  if (template.catalogRefs.length === 0) return false;

  const loaded = template.catalogRefs.map((ref) => {
    return catalogs.find((c) => c.name === ref.name && c.version === ref.version) ?? null;
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
