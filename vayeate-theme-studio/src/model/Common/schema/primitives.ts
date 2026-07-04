import * as z from 'zod';

// --- Primitive regexes ---

/**
 * Alphanumeric identifier with hyphens only; no spaces or other punctuation.
 */
const NAME_REGEX = /^[a-zA-Z0-9-]+$/;
/**
 * Semantic version string, optionally prefixed with `v`, with optional pre-release and build segments.
 */
const SEMVER_REGEX = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
/**
 * Identifier starting with a letter, followed by letters or digits; used for color and contrast variable keys.
 */
const VARIABLE_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;
/** VS Code-style token key: dot-, space-, or colon-separated segments of letters, digits, `*`, `_`, or `-`. */
const TOKEN_KEY_REGEX = /^([a-zA-Z*0-9][a-zA-Z0-9_*-]*)((\.| |:)([a-zA-Z*0-9][a-zA-Z0-9_*-]*))*$/;
/**
 * Bare hex color digits without `#`: exactly 3, 6, or 8 hexadecimal characters.
 */
const BARE_HEX_REGEX = /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

/**
 * Normalizes a hex color string to canonical `#` plus hex form.
 *
 * @param s - Hex string with optional leading `#` and 3, 6, or 8 digits.
 * @returns Normalized color as `#` followed by the hex digits.
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

/**
 * Zod schema for HTTP or HTTPS URL strings.
 */
export const urlSchema = z.httpUrl();
/**
 * Validated HTTP or HTTPS URL string.
 */
export type Url = z.infer<typeof urlSchema>;

/**
 * Zod schema for semantic version strings matching `SEMVER_REGEX`.
 */
export const versionSchema = z.string().regex(SEMVER_REGEX);
/**
 * Semantic version string in `major.minor.patch` form with optional pre-release or build suffix.
 */
export type Version = z.infer<typeof versionSchema>;

/**
 * Zod schema for catalog artifact names matching `NAME_REGEX`.
 */
export const catalogNameSchema = z.string().regex(NAME_REGEX);
/**
 * Catalog artifact name: alphanumeric segments separated by hyphens.
 */
export type CatalogName = z.infer<typeof catalogNameSchema>;

/**
 * Zod schema for template artifact names matching `NAME_REGEX`.
 */
export const templateNameSchema = z.string().regex(NAME_REGEX);
/**
 * Template artifact name: alphanumeric segments separated by hyphens.
 */
export type TemplateName = z.infer<typeof templateNameSchema>;

/**
 * Zod schema for theme artifact names matching `NAME_REGEX`.
 */
export const themeNameSchema = z.string().regex(NAME_REGEX);
/**
 * Theme artifact name: alphanumeric segments separated by hyphens.
 */
export type ThemeName = z.infer<typeof themeNameSchema>;

/**
 * Zod schema for color variable keys matching `VARIABLE_KEY_REGEX`.
 */
export const colorVariableKeySchema = z.string().regex(VARIABLE_KEY_REGEX);
/**
 * Color variable key: letter-first identifier of letters and digits.
 */
export type ColorVariableKey = z.infer<typeof colorVariableKeySchema>;

/**
 * Zod schema for contrast variable keys matching `VARIABLE_KEY_REGEX`.
 */
export const contrastVariableKeySchema = z.string().regex(VARIABLE_KEY_REGEX);
/**
 * Contrast variable key: letter-first identifier of letters and digits.
 */
export type ContrastVariableKey = z.infer<typeof contrastVariableKeySchema>;

/**
 * Zod schema for style variable keys matching `VARIABLE_KEY_REGEX`.
 */
export const styleVariableKeySchema = z.string().regex(VARIABLE_KEY_REGEX);
/**
 * Style variable key: letter-first identifier of letters and digits.
 */
export type StyleVariableKey = z.infer<typeof styleVariableKeySchema>;

/**
 * Zod schema for VS Code-style token keys matching `TOKEN_KEY_REGEX`.
 */
export const tokenKeySchema = z.string().regex(TOKEN_KEY_REGEX);
/**
 * Token key using dot, space, or colon segment separators.
 */
export type TokenKey = z.infer<typeof tokenKeySchema>;

/**
 * Zod schema for hex colors; trims input, accepts optional `#`, and normalizes to `#` plus hex.
 */
export const hexColorSchema = z
  .string()
  .transform((s) => normalizeHex(s));
/**
 * Normalized hex color string with leading `#` and 3, 6, or 8 digits.
 */
export type HexColor = z.infer<typeof hexColorSchema>;

/**
 * Zod schema for contrast ratio values between 1 and 10 inclusive, parsed from number or numeric string.
 */
export const contrastValueSchema = z
  .union([z.number(), z.string().transform((s) => Number.parseFloat(s))])
  .refine((n) => typeof n === 'number' && !Number.isNaN(n) && n >= 1 && n <= 10);
/**
 * Contrast ratio from 1 (no contrast) through 10 (maximum).
 */
export type ContrastValue = z.infer<typeof contrastValueSchema>;

// --- Enum / literal schemas ---

/**
 * Zod schema for catalog origin: user-managed manual or remote-fetched.
 */
export const catalogTypeSchema = z.enum(['manual', 'remote']);
/**
 * Whether the catalog is authored locally or loaded from a remote source.
 */
export type CatalogType = z.infer<typeof catalogTypeSchema>;

/**
 * Zod schema for catalog source file or registry kind.
 */
export const sourceTypeSchema = z.enum([
  'default',
  'color-registry',
  'color-registry-set',
  'semantic-token-registry',
  'textmate-xml',
  'textmate-json',
]);
/**
 * Kind of upstream file or registry that supplies tokens for a catalog source.
 */
export type SourceType = z.infer<typeof sourceTypeSchema>;

/**
 * Zod schema for token classification within a catalog.
 */
export const tokenTypeSchema = z.enum(['theme', 'textmate token', 'semantic token']);
/**
 * Token category: theme color key, TextMate scope, or semantic selector.
 */
export type TokenType = z.infer<typeof tokenTypeSchema>;

/**
 * Zod schema for which semantic-token registry list a catalog entry belongs to.
 */
export const semanticTokenRegistryListKindSchema = z.enum(['types', 'modifiers', 'languages']);
/**
 * Semantic token registry list kind: types, modifiers, or languages.
 */
export type SemanticTokenRegistryListKind = z.infer<typeof semanticTokenRegistryListKindSchema>;

/**
 * Zod schema for contrast comparison operators used in contrast assignments.
 */
export const contrastComparisonMethodSchema = z.enum(['lessThan', 'equalTo', 'greaterThan']);
/**
 * How a contrast value is compared against a reference or bounds.
 */
export type ContrastComparisonMethod = z.infer<typeof contrastComparisonMethodSchema>;

/**
 * Zod schema for application UI color scheme preference.
 */
export const colorSchemeSchema = z.enum(['light', 'dark']);
/**
 * Light or dark UI color scheme.
 */
export type ColorScheme = z.infer<typeof colorSchemeSchema>;

/**
 * Zod schema for persisted application configuration.
 */
export const appConfigSchema = z.object({
  /**
   * Preferred UI color scheme; light or dark.
   */
  colorScheme: colorSchemeSchema,
});
/**
 * Persisted application settings loaded from disk.
 */
export type AppConfig = z.infer<typeof appConfigSchema>;
