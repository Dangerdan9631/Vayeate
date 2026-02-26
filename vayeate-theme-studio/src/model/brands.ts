declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

/** URL. Used by Source.url */
export type Url = Brand<string, 'Url'>;

/** Catalog.name */
export type CatalogName = Brand<string, 'CatalogName'>;

/** Version. Used by Catalog.version, Template.version, Theme.version */
export type Version = Brand<string, 'Version'>;

/** ColorVariable.key */
export type ColorVariableKey = Brand<string, 'ColorVariableKey'>;

/** ContrastVariable.key */
export type ContrastVariableKey = Brand<string, 'ContrastVariableKey'>;

/** Template.name */
export type TemplateName = Brand<string, 'TemplateName'>;

/** Token.key */
export type TokenKey = Brand<string, 'TokenKey'>;

/** Hex color string (e.g. #rrggbb). Used by ColorAssignmentValue.value */
export type HexColor = Brand<string, 'HexColor'>;

/** Contrast numeric value (1.0–10.0). Used by ContrastAssignmentValue.value, min, max */
export type ContrastValue = Brand<number, 'ContrastValue'>;

/** Theme.name */
export type ThemeName = Brand<string, 'ThemeName'>;

// --- Parser helpers (patterns) ---

/** Web URL: http or https. */
function isValidUrl(s: string): boolean {
  if (typeof s !== 'string' || s.length === 0) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Alphanumeric or '-'. */
const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

/** Semver: optional v, major.minor.patch, optional -prerelease and +build. */
const SEMVER_REGEX = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;

/** Alphanumeric, must start with a letter. */
const VARIABLE_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

/** Alphanumeric with '-' or '.'. */
const TOKEN_KEY_REGEX = /^[a-zA-Z0-9.-]+$/;

/** RGB hex: #rgb or #rrggbb (optional #rrggbbaa). */
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;

const CONTRAST_MIN = 1;
const CONTRAST_MAX = 10;

// --- Parsers (return null) and parseOrThrow ---

export function parseUrl(s: string): Url | null {
  return isValidUrl(s) ? (s as Url) : null;
}

export function parseUrlOrThrow(s: string): Url {
  const out = parseUrl(s);
  if (out === null) throw new Error(`Invalid web URL: ${JSON.stringify(s)}`);
  return out;
}

export function parseCatalogName(s: string): CatalogName | null {
  return typeof s === 'string' && NAME_REGEX.test(s) ? (s as CatalogName) : null;
}

export function parseCatalogNameOrThrow(s: string): CatalogName {
  const out = parseCatalogName(s);
  if (out === null) throw new Error(`Invalid catalog name (alphanumeric or '-'): ${JSON.stringify(s)}`);
  return out;
}

export function parseTemplateName(s: string): TemplateName | null {
  return typeof s === 'string' && NAME_REGEX.test(s) ? (s as TemplateName) : null;
}

export function parseTemplateNameOrThrow(s: string): TemplateName {
  const out = parseTemplateName(s);
  if (out === null) throw new Error(`Invalid template name (alphanumeric or '-'): ${JSON.stringify(s)}`);
  return out;
}

export function parseThemeName(s: string): ThemeName | null {
  return typeof s === 'string' && NAME_REGEX.test(s) ? (s as ThemeName) : null;
}

export function parseThemeNameOrThrow(s: string): ThemeName {
  const out = parseThemeName(s);
  if (out === null) throw new Error(`Invalid theme name (alphanumeric or '-'): ${JSON.stringify(s)}`);
  return out;
}

export function parseVersion(s: string): Version | null {
  return typeof s === 'string' && SEMVER_REGEX.test(s) ? (s as Version) : null;
}

export function parseVersionOrThrow(s: string): Version {
  const out = parseVersion(s);
  if (out === null) throw new Error(`Invalid semver version: ${JSON.stringify(s)}`);
  return out;
}

export function parseColorVariableKey(s: string): ColorVariableKey | null {
  return typeof s === 'string' && VARIABLE_KEY_REGEX.test(s) ? (s as ColorVariableKey) : null;
}

export function parseColorVariableKeyOrThrow(s: string): ColorVariableKey {
  const out = parseColorVariableKey(s);
  if (out === null) throw new Error(`Invalid color variable key (alphanumeric, start with letter): ${JSON.stringify(s)}`);
  return out;
}

export function parseContrastVariableKey(s: string): ContrastVariableKey | null {
  return typeof s === 'string' && VARIABLE_KEY_REGEX.test(s) ? (s as ContrastVariableKey) : null;
}

export function parseContrastVariableKeyOrThrow(s: string): ContrastVariableKey {
  const out = parseContrastVariableKey(s);
  if (out === null) throw new Error(`Invalid contrast variable key (alphanumeric, start with letter): ${JSON.stringify(s)}`);
  return out;
}

export function parseTokenKey(s: string): TokenKey | null {
  return typeof s === 'string' && TOKEN_KEY_REGEX.test(s) ? (s as TokenKey) : null;
}

export function parseTokenKeyOrThrow(s: string): TokenKey {
  const out = parseTokenKey(s);
  if (out === null) throw new Error(`Invalid token key (alphanumeric, '-' or '.'): ${JSON.stringify(s)}`);
  return out;
}

export function parseHexColor(s: string): HexColor | null {
  return typeof s === 'string' && HEX_COLOR_REGEX.test(s) ? (s as HexColor) : null;
}

export function parseHexColorOrThrow(s: string): HexColor {
  const out = parseHexColor(s);
  if (out === null) throw new Error(`Invalid RGB hex color: ${JSON.stringify(s)}`);
  return out;
}

export function parseContrastValue(n: number | string): ContrastValue | null {
  const num = typeof n === 'string' ? Number.parseFloat(n) : n;
  if (typeof num !== 'number' || Number.isNaN(num)) return null;
  if (num < CONTRAST_MIN || num > CONTRAST_MAX) return null;
  return num as ContrastValue;
}

export function parseContrastValueOrThrow(n: number | string): ContrastValue {
  const out = parseContrastValue(n);
  if (out === null) throw new Error(`Invalid contrast value (1.0–10.0): ${n}`);
  return out;
}
