import { parseSemanticSelector } from './parse-semantic-selector';
import type { ParsedSemanticSelector, SemanticCatalogArrays } from './semantic-selector-types';

/**
 * Parse a selector and merge into the given catalog arrays. Returns merged, deduped, sorted
 * arrays, or null if the selector is invalid or contributes nothing (e.g. empty, or only "*").
 *
 * @param selector - Semantic selector string to parse and merge.
 * @param current - Existing catalog type, modifier, and language lists.
 * @returns Updated sorted arrays, or null when the selector adds no catalog entries.
 */
export function mergeSemanticSelectorInto(
  selector: string,
  current: SemanticCatalogArrays,
): SemanticCatalogArrays | null {
  const trimmed = selector.trim();
  if (!trimmed) return null;
  let parsed: ParsedSemanticSelector;
  try {
    parsed = parseSemanticSelector(trimmed);
  } catch {
    return null;
  }
  const hasType = parsed.type && parsed.type !== '*';
  const hasModifiers = parsed.modifiers.length > 0;
  const hasLanguage = parsed.language != null && parsed.language !== '';
  if (!hasType && !hasModifiers && !hasLanguage) return null;

  const types = hasType
    ? [...new Set([...current.types, parsed.type])].sort()
    : [...current.types];
  const modifiers =
    parsed.modifiers.length > 0
      ? [...new Set([...current.modifiers, ...parsed.modifiers])].sort()
      : [...current.modifiers];
  const languages = hasLanguage && parsed.language
    ? [...new Set([...current.languages, parsed.language])].sort()
    : [...current.languages];

  return { types, modifiers, languages };
}
