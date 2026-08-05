/**
 * Build the canonical selector string from type, modifiers, and optional language.
 *
 * @param type - Selector type segment; empty type yields an empty string.
 * @param modifiers - Modifier segments appended in sorted dot notation.
 * @param language - Optional language suffix after `:`; omitted when null or unused.
 * @returns Canonical `type.modifier:language` string for storage and display.
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
