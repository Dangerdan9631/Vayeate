import { injectable } from 'tsyringe';
import type { Catalog, SemanticTokenRegistryListKind } from '../../../../model/schemas';

@injectable()
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
