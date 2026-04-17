import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { SemanticTokenRegistryListKind } from '../../../../model/schema/primitives';

@singleton()
export class UpdateSemanticTokenRegistryEntryOperation {
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
