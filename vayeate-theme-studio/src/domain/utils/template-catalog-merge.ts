import { parseSemanticSelector } from './semantic-token';
import type {
  CatalogReference,
  Mapping,
  MergeMappingsResult,
  Token,
} from '../../model/schemas';

/** Pre-loaded catalog data for mergeMappingsFromCatalogData. */
export interface CatalogDataItem {
  ref: CatalogReference;
  tokens: readonly Token[];
  semanticTokenTypes?: readonly string[];
  semanticTokenModifiers?: readonly string[];
  semanticTokenLanguages?: readonly string[];
}

/**
 * Merge template mappings with pre-loaded catalog tokens.
 * Used by template controller after loading catalogs via catalogService.
 */
export function mergeMappingsFromCatalogData(
  catalogData: readonly CatalogDataItem[],
  existingMappings: readonly Mapping[],
): MergeMappingsResult {
  const semanticTypesSet = new Set<string>();
  const semanticTypeToRef = new Map<string, string>();
  const modifiersSet = new Set<string>();
  const languagesSet = new Set<string>();
  for (const { ref, semanticTokenTypes = [], semanticTokenModifiers = [], semanticTokenLanguages = [] } of catalogData) {
    for (const t of semanticTokenTypes) {
      semanticTypesSet.add(t);
      if (!semanticTypeToRef.has(t)) semanticTypeToRef.set(t, ref.name);
    }
    semanticTokenModifiers.forEach((m) => modifiersSet.add(m));
    semanticTokenLanguages.forEach((l) => languagesSet.add(l));
  }

  const allTokens = catalogData.flatMap(({ tokens }) => tokens);
  const catalogTokenKeys = new Set(allTokens.map((t) => `${t.type}::${t.key}`));
  for (const type of semanticTypesSet) {
    catalogTokenKeys.add(`semantic token::${type}`);
  }

  const existingKeys = new Set(
    existingMappings.map((m) => `${m.token.type}::${m.token.key}`),
  );

  const newMappings: Mapping[] = [];
  const groupsToEnsure = new Set<string>();

  for (const m of existingMappings) {
    const key = `${m.token.type}::${m.token.key}`;
    const inCatalog = catalogTokenKeys.has(key);
    const hasColorAssignment = m.colorVariableRef !== null;
    if (inCatalog) {
      newMappings.push(m);
    } else if (hasColorAssignment) {
      newMappings.push(m);
    }
  }

  for (const { ref, tokens } of catalogData) {
    for (const token of tokens) {
      const key = `${token.type}::${token.key}`;
      if (!existingKeys.has(key)) {
        newMappings.push({
          token,
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: ref.name,
        });
        groupsToEnsure.add(ref.name);
        existingKeys.add(key);
      }
    }
  }

  for (const type of semanticTypesSet) {
    const key = `semantic token::${type}`;
    if (existingKeys.has(key)) continue;
    const groupRef = semanticTypeToRef.get(type) ?? null;
    if (groupRef) groupsToEnsure.add(groupRef);
    newMappings.push({
      token: { key: type, type: 'semantic token' },
      colorVariableRef: null,
      contrastVariableRef: null,
      groupRef,
    });
    existingKeys.add(key);
  }

  for (const m of newMappings) {
    if (m.token.type !== 'semantic token') continue;
    try {
      const parsed = parseSemanticSelector(m.token.key);
      parsed.modifiers.forEach((mod) => modifiersSet.add(mod));
      if (parsed.language && parsed.language.trim() !== '') languagesSet.add(parsed.language);
    } catch {
      // skip invalid selectors
    }
  }

  const semanticTokenModifiers = [...modifiersSet].sort();
  const semanticTokenLanguages = [...languagesSet].sort();
  return {
    mappings: newMappings,
    groupsToEnsure: [...groupsToEnsure],
    semanticTokenModifiers,
    semanticTokenLanguages,
  };
}
