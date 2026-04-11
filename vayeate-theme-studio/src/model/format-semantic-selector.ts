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
