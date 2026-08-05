import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/Catalog/schema/catalog';
import type { TokenType } from '../../../../model/Common/schema/primitives';
import type { Template } from '../../../../model/Template/schema/template-schemas';
import { computeOrphanKeys, type SemanticCatalogInfo } from '../../../utils/Common/compute-orphan-keys';

/**
 * Checks whether a mapping token is orphaned for a template.
 */
@singleton()
export class ValidateIsMappingOrphanForTemplate {
  /**
   * Reports whether a mapping token is absent from all loaded template catalogs.
   * @param template Template whose catalog refs define the valid token universe.
   * @param tokenKey Token key of the mapping under test.
   * @param tokenType Token type discriminant for the mapping.
   * @param catalogs Loaded catalog entities referenced by the template.
   * @returns True when the token is absent from loaded catalogs and semantic metadata.
   */
  test(
    template: Template,
    tokenKey: string,
    tokenType: TokenType,
    catalogs: readonly Catalog[],
  ): boolean {
    if (template.catalogRefs.length === 0) return false;

    const loaded = template.catalogRefs.map((ref) => {
      return catalogs.find((catalog) => catalog.name === ref.name && catalog.version === ref.version) ?? null;
    });
    if (!loaded.every((catalog): catalog is Catalog => catalog !== null)) return false;

    const allTokens: Token[] = [];
    const typesSet = new Set<string>();
    const modifiersSet = new Set<string>();
    const languagesSet = new Set<string>();
    for (const catalog of loaded) {
      allTokens.push(...catalog.tokens);
      (catalog.semanticTokenTypes ?? []).forEach((type: string) => typesSet.add(type));
      (catalog.semanticTokenModifiers ?? []).forEach((modifier: string) => modifiersSet.add(modifier));
      (catalog.semanticTokenLanguages ?? []).forEach((language: string) => languagesSet.add(language));
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
}
