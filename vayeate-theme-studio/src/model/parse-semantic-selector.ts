import { parsedSemanticSelectorSchema } from './semantic-selector-types';
import type { ParsedSemanticSelector } from './semantic-selector-types';

/**
 * Parse a semantic token selector into type, modifiers, and optional language.
 * "*" is a valid type but is not added to catalog type list by callers.
 */
export function parseSemanticSelector(selector: string): ParsedSemanticSelector {
  const result = safeParseSemanticSelector(selector);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw new Error(firstIssue?.message ?? 'Invalid semantic selector');
  }

  return result.data;
}

export function safeParseSemanticSelector(selector: string) {
  const trimmed = selector.trim();
  if (!trimmed) {
    return parsedSemanticSelectorSchema.safeParse({ type: '', modifiers: [], language: null });
  }

  const colonIndex = trimmed.indexOf(':');
  const languagePart = colonIndex >= 0 ? trimmed.slice(colonIndex + 1) : null;
  const beforeLanguage = colonIndex >= 0 ? trimmed.slice(0, colonIndex) : trimmed;

  const segments = beforeLanguage.split('.').map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) {
    return parsedSemanticSelectorSchema.safeParse({
      type: '',
      modifiers: [],
      language: languagePart === null || languagePart === '' ? null : languagePart,
    });
  }

  return parsedSemanticSelectorSchema.safeParse({
    type: segments[0],
    modifiers: segments.slice(1),
    language: languagePart === null || languagePart === '' ? null : languagePart,
  });
}
