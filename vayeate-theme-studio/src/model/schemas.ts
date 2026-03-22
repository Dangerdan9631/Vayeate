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

export const contrastComparisonMethodSchema = z.enum(['lessThan', 'equalTo', 'greaterThan']);
export type ContrastComparisonMethod = z.infer<typeof contrastComparisonMethodSchema>;

export const colorSchemeSchema = z.enum(['light', 'dark']);
export type ColorScheme = z.infer<typeof colorSchemeSchema>;

/** Persisted Theme Studio preferences (`data/config.json`). */
export const appConfigSchema = z.object({
  colorScheme: colorSchemeSchema,
});
export type AppConfig = z.infer<typeof appConfigSchema>;

// --- Token ---

export const tokenSchema = z
  .object({
    key: tokenKeySchema,
    type: tokenTypeSchema,
  })
  .readonly();
export type Token = z.infer<typeof tokenSchema>;

// --- Source & Catalog ---

export const sourceSchema = z
  .object({
    url: urlSchema,
    type: sourceTypeSchema,
    tokenType: tokenTypeSchema,
  })
  .readonly()
  .refine(
    (s) => {
      if (s.type === 'default') return true;
      if (s.type === 'color-registry' || s.type === 'color-registry-set') return s.tokenType === 'theme';
      if (s.type === 'semantic-token-registry') return s.tokenType === 'semantic token';
      if (s.type === 'textmate-xml' || s.type === 'textmate-json') return s.tokenType === 'textmate token';
      return true;
    },
    {
      message:
        'color-registry and color-registry-set require tokenType theme; semantic-token-registry requires tokenType semantic token; textmate-xml and textmate-json require tokenType textmate token',
    },
  );
export type Source = z.infer<typeof sourceSchema>;

const semanticTokenTypeOrModifierSchema = z.string();
const semanticTokenLanguageSchema = z.string();

export const catalogSchema = z
  .object({
    name: catalogNameSchema,
    version: versionSchema,
    type: catalogTypeSchema,
    locked: z.boolean(),
    sources: z.array(sourceSchema).readonly(),
    tokens: z.array(tokenSchema).readonly(),
    semanticTokenTypes: z.array(semanticTokenTypeOrModifierSchema).readonly().optional().default([]),
    semanticTokenModifiers: z.array(semanticTokenTypeOrModifierSchema).readonly().optional().default([]),
    semanticTokenLanguages: z.array(semanticTokenLanguageSchema).readonly().optional().default([]),
  })
  .readonly();
export type Catalog = z.infer<typeof catalogSchema>;

// --- CatalogReference, ColorVariable, ContrastVariable, Mapping, Template ---

export const catalogReferenceSchema = z
  .object({
    name: catalogNameSchema,
    version: versionSchema,
  })
  .readonly();
export type CatalogReference = z.infer<typeof catalogReferenceSchema>;

export const colorVariableSchema = z
  .object({
    key: colorVariableKeySchema,
    groupRef: z.string().nullable().optional().default(null),
  })
  .readonly();
export type ColorVariable = z.infer<typeof colorVariableSchema>;

export const contrastVariableSchema = z
  .object({
    key: contrastVariableKeySchema,
    comparisonSourceRef: colorVariableKeySchema.nullable(),
    groupRef: z.string().nullable().optional().default(null),
  })
  .readonly();
export type ContrastVariable = z.infer<typeof contrastVariableSchema>;

export const mappingSchema = z
  .object({
    token: tokenSchema,
    colorVariableRef: colorVariableKeySchema.nullable(),
    contrastVariableRef: contrastVariableKeySchema.nullable(),
    groupRef: z.string().nullable().optional().default(null),
  })
  .readonly();
export type Mapping = z.infer<typeof mappingSchema>;

export const templateSchema = z
  .object({
    name: templateNameSchema,
    version: versionSchema,
    locked: z.boolean(),
    catalogRefs: z.array(catalogReferenceSchema).readonly(),
    mappings: z.array(mappingSchema).readonly(),
    colorVariables: z.array(colorVariableSchema).readonly(),
    contrastVariables: z.array(contrastVariableSchema).readonly(),
    groups: z.array(z.string()).readonly().default([]),
    semanticTokenModifiers: z.array(semanticTokenTypeOrModifierSchema).readonly().optional().default([]),
    semanticTokenLanguages: z.array(semanticTokenLanguageSchema).readonly().optional().default([]),
  })
  .readonly();
export type Template = z.infer<typeof templateSchema>;

// --- TemplateReference, ColorAssignment, ContrastAssignment, Theme ---

export const templateReferenceSchema = z
  .object({
    name: templateNameSchema,
    version: versionSchema,
  })
  .readonly();
export type TemplateReference = z.infer<typeof templateReferenceSchema>;

export const themeReferenceSchema = z
  .object({
    name: themeNameSchema,
    version: versionSchema,
  })
  .readonly();
export type ThemeReference = z.infer<typeof themeReferenceSchema>;

export const colorAssignmentValueSchema = z
  .object({
    value: hexColorSchema,
  })
  .readonly();
export type ColorAssignmentValue = z.infer<typeof colorAssignmentValueSchema>;

export const colorAssignmentSchema = z
  .object({
    colorRef: colorVariableKeySchema,
    light: colorAssignmentValueSchema.nullable(),
    dark: colorAssignmentValueSchema.nullable(),
    useDarkForLight: z.boolean(),
  })
  .readonly();
export type ColorAssignment = z.infer<typeof colorAssignmentSchema>;

export const contrastAssignmentValueSchema = z
  .object({
    value: contrastValueSchema,
    comparisonMethod: contrastComparisonMethodSchema,
    min: contrastValueSchema.nullable(),
    max: contrastValueSchema.nullable(),
  })
  .readonly();
export type ContrastAssignmentValue = z.infer<typeof contrastAssignmentValueSchema>;

export const contrastAssignmentSchema = z
  .object({
    contrastVariableRef: contrastVariableKeySchema,
    light: contrastAssignmentValueSchema.nullable(),
    dark: contrastAssignmentValueSchema.nullable(),
    useDarkForLight: z.boolean(),
  })
  .readonly();
export type ContrastAssignment = z.infer<typeof contrastAssignmentSchema>;

export const themeSchema = z
  .object({
    name: themeNameSchema,
    version: versionSchema,
    templateRef: templateReferenceSchema.nullable(),
    idePrimaryTokenRef: tokenKeySchema.nullable().optional().default(null),
    ideForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    themeBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    themeForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    lineNumberBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    lineNumberForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    ideTabTokenRef: tokenKeySchema.nullable().optional().default(null),
    ideTabBarBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    ideTabBarForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    editorPreviewScrollbarBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    editorPreviewScrollbarForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    editorPreviewSelectionBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    editorPreviewMenuForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    editorPreviewMenuBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    colorAssignments: z.array(colorAssignmentSchema).readonly(),
    contrastAssignments: z.array(contrastAssignmentSchema).readonly(),
    /** Apply hue adjustments to dark theme colors (palette UI). */
    applyPaletteToDark: z.boolean().optional().default(true),
    /** Apply hue adjustments to light theme colors (palette UI). */
    applyPaletteToLight: z.boolean().optional().default(true),
    /** Cluster count (k) for palette swatch grouping; 1–12. */
    paletteClusterCountK: z.number().min(1).max(12).optional().default(5),
    /** Group IDs included in cluster view; omit or empty = all groups. */
    paletteClusterGroupIds: z.array(z.string()).readonly().optional().default([]),
  })
  .readonly();
export type Theme = z.infer<typeof themeSchema>;

/** Theme fields that hold a preview token ref (TokenKey | null). Used by theme controller and action types. */
export type ThemePreviewTokenRefField =
  | 'idePrimaryTokenRef'
  | 'ideForegroundTokenRef'
  | 'themeBackgroundTokenRef'
  | 'themeForegroundTokenRef'
  | 'lineNumberBackgroundTokenRef'
  | 'lineNumberForegroundTokenRef'
  | 'ideTabTokenRef'
  | 'ideTabBarBackgroundTokenRef'
  | 'ideTabBarForegroundTokenRef'
  | 'editorPreviewScrollbarBackgroundTokenRef'
  | 'editorPreviewScrollbarForegroundTokenRef'
  | 'editorPreviewSelectionBackgroundTokenRef'
  | 'editorPreviewMenuForegroundTokenRef'
  | 'editorPreviewMenuBackgroundTokenRef';

/** Result of merging template mappings with catalog tokens. Used by domain and app. */
export interface MergeMappingsResult {
  mappings: Mapping[];
  groupsToEnsure: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
}
