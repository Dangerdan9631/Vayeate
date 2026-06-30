import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { SemanticTokenRegistryListKind } from '../../../../model/schema/primitives';

/**
 * Removes semantic token list item from the parent entity in the store.
 */

@singleton()
export class RemoveSemanticTokenListItemOperation {

  /**
   * Runs the remove semantic token list item mutation.
   * @param catalog Catalog (Catalog).
   * @param kind Kind (SemanticTokenRegistryListKind).
   * @param index Index (number).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, kind: SemanticTokenRegistryListKind, index: number): Catalog {
    const field =
      kind === 'types'
        ? 'semanticTokenTypes'
        : kind === 'modifiers'
          ? 'semanticTokenModifiers'
          : 'semanticTokenLanguages';
    const current = [...(catalog[field] ?? [])];
    if (index < 0 || index >= current.length) {
      return catalog;
    }
    current.splice(index, 1);
    return { ...catalog, [field]: current };
  }
}
