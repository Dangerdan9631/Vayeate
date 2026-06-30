import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { SemanticTokenRegistryListKind } from '../../../../model/schema/primitives';

/**
 * Updates semantic token registry entry in the store.
 */

@singleton()
export class UpdateSemanticTokenRegistryEntryOperation {

  /**
   * Runs the update semantic token registry entry mutation.
   * @param catalog Catalog (Catalog).
   * @param kind Kind (SemanticTokenRegistryListKind).
   * @param index Index (number).
   * @param value Value (string).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, kind: SemanticTokenRegistryListKind, index: number, value: string): Catalog {
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
    const next = [...current];
    next[index] = value;
    return { ...catalog, [field]: next };
  }
}
