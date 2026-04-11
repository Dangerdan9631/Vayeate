import type { ParsedSemanticSelector } from './semantic-selector-types';

const SEGMENT_REGEX = /^[a-zA-Z*][a-zA-Z0-9_*-]*$/;

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
