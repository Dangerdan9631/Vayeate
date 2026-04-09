import { injectable } from 'tsyringe';
import type { Catalog, SemanticTokenRegistryListKind } from '../../../../model/schemas';

@injectable()
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
