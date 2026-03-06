/**
 * Parse and format VS Code semantic token selectors.
 * Format: (*|tokenType)(.tokenModifier)*(:tokenLanguage)?
 * See https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
 */

const SEGMENT_REGEX = /^[a-zA-Z*][a-zA-Z0-9_*-]*$/;

export interface ParsedSemanticSelector {
  type: string;
  modifiers: string[];
  language: string | null;
}

/**
 * Parse a semantic token selector into type, modifiers, and optional language.
 * "*" is a valid type but is not added to catalog type list by callers.
 */
export function parseSemanticSelector(selector: string): ParsedSemanticSelector {
  const trimmed = selector.trim();
  if (!trimmed) {
    return { type: '', modifiers: [], language: null };
  }

  const colonIndex = trimmed.indexOf(':');
  const languagePart = colonIndex >= 0 ? trimmed.slice(colonIndex + 1) : null;
  const beforeLanguage = colonIndex >= 0 ? trimmed.slice(0, colonIndex) : trimmed;

  const segments = beforeLanguage.split('.').map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) {
    return { type: '', modifiers: [], language: languagePart };
  }

  const type = segments[0];
  const modifiers = segments.slice(1);

  for (const seg of [type, ...modifiers]) {
    if (!SEGMENT_REGEX.test(seg)) {
      throw new Error(`Invalid semantic selector segment: ${seg}`);
    }
  }
  if (languagePart !== null && languagePart !== '' && !SEGMENT_REGEX.test(languagePart)) {
    throw new Error(`Invalid semantic selector language: ${languagePart}`);
  }

  return {
    type,
    modifiers,
    language: languagePart === null || languagePart === '' ? null : languagePart,
  };
}

export interface SemanticCatalogArrays {
  types: readonly string[];
  modifiers: readonly string[];
  languages: readonly string[];
}

/**
 * Parse a selector and merge into the given catalog arrays. Returns merged, deduped, sorted
 * arrays, or null if the selector is invalid or contributes nothing (e.g. empty, or only "*").
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

/**
 * Build the canonical selector string from type, modifiers, and optional language.
 */
export function formatSemanticSelector(
  type: string,
  modifiers: string[],
  language: string | null,
): string {
  if (!type) return '';
  const modPart = modifiers.length > 0 ? '.' + [...modifiers].sort().join('.') : '';
  const langPart = language ? ':' + language : '';
  return type + modPart + langPart;
}
