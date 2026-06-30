/**
 * Normalizes a theme hex string for display by trimming and ensuring a leading `#`.
 *
 * @param hex - Raw hex input from theme assignments or UI fields.
 * @returns Lowercase hex with `#` prefix, or empty string when input is blank.
 */
export function normalizeThemeHex(hex: string): string {
  const s = (hex ?? '').trim().toLowerCase();
  return s.startsWith('#') ? s : s ? `#${s}` : '';
}
