import * as z from 'zod';

// --- Primitive regexes ---

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;
const SEMVER_REGEX = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
const VARIABLE_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;
const TOKEN_KEY_REGEX = /^([a-zA-Z*0-9][a-zA-Z0-9_*-]*)((\.| |:)([a-zA-Z*0-9][a-zA-Z0-9_*-]*))*$/;
/** Bare hex (no #): 3, 6, or 8 hex digits only */
const BARE_HEX_REGEX = /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

/**
 * Normalizes a hex color string to canonical form (# + hex). Accepts optional
 * leading # and 3, 6, or 8 hex digits. Returns normalized string or throws.
 */
function normalizeHex(s: string): string {
  const trimmed = s.trim();
  const hexPart = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (!BARE_HEX_REGEX.test(hexPart)) {
    throw new Error('Invalid hex color');
  }
  return '#' + hexPart;
}

// --- Primitive schemas ---

export const urlSchema = z.httpUrl();
export type Url = z.infer<typeof urlSchema>;

export const versionSchema = z.string().regex(SEMVER_REGEX);
export type Version = z.infer<typeof versionSchema>;

export const catalogNameSchema = z.string().regex(NAME_REGEX);
export type CatalogName = z.infer<typeof catalogNameSchema>;

export const templateNameSchema = z.string().regex(NAME_REGEX);
export type TemplateName = z.infer<typeof templateNameSchema>;

export const themeNameSchema = z.string().regex(NAME_REGEX);
export type ThemeName = z.infer<typeof themeNameSchema>;

export const colorVariableKeySchema = z.string().regex(VARIABLE_KEY_REGEX);
export type ColorVariableKey = z.infer<typeof colorVariableKeySchema>;

export const contrastVariableKeySchema = z.string().regex(VARIABLE_KEY_REGEX);
export type ContrastVariableKey = z.infer<typeof contrastVariableKeySchema>;

export const tokenKeySchema = z.string().regex(TOKEN_KEY_REGEX);
export type TokenKey = z.infer<typeof tokenKeySchema>;

export const hexColorSchema = z
  .string()
  .transform((s) => normalizeHex(s));
export type HexColor = z.infer<typeof hexColorSchema>;

export const contrastValueSchema = z
  .union([z.number(), z.string().transform((s) => Number.parseFloat(s))])
  .refine((n) => typeof n === 'number' && !Number.isNaN(n) && n >= 1 && n <= 10);
export type ContrastValue = z.infer<typeof contrastValueSchema>;

// --- Enum / literal schemas ---

export const catalogTypeSchema = z.enum(['manual', 'remote']);
export type CatalogType = z.infer<typeof catalogTypeSchema>;

export const sourceTypeSchema = z.enum([
  'default',
  'color-registry',
  'color-registry-set',
  'semantic-token-registry',
  'textmate-xml',
  'textmate-json',
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const tokenTypeSchema = z.enum(['theme', 'textmate token', 'semantic token']);
export type TokenType = z.infer<typeof tokenTypeSchema>;

export const semanticTokenRegistryListKindSchema = z.enum(['types', 'modifiers', 'languages']);
export type SemanticTokenRegistryListKind = z.infer<typeof semanticTokenRegistryListKindSchema>;

export const contrastComparisonMethodSchema = z.enum(['lessThan', 'equalTo', 'greaterThan']);
export type ContrastComparisonMethod = z.infer<typeof contrastComparisonMethodSchema>;

export const colorSchemeSchema = z.enum(['light', 'dark']);
export type ColorScheme = z.infer<typeof colorSchemeSchema>;

export const appConfigSchema = z.object({
  colorScheme: colorSchemeSchema,
});
export type AppConfig = z.infer<typeof appConfigSchema>;
