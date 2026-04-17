import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { SemanticTokenRegistryListKind } from '../../../../model/schema/primitives';

@singleton()
export class RemoveSemanticTokenListItemOperation {
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
