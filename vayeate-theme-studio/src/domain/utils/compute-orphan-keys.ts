import type { Token } from '../../model/schema/catalog';
import type { Mapping } from '../../model/schema/template-schemas';
import { parseSemanticSelector } from '../../model/parse-semantic-selector';
import { SEMANTIC_WILDCARD_TYPE } from '../../model/semantic-token-constants';

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
