import * as z from 'zod';

// --- Primitive regexes ---

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;
const SEMVER_REGEX = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
const VARIABLE_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;
const TOKEN_KEY_REGEX = /^[a-zA-Z0-9.-]+$/;
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;

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

export const hexColorSchema = z.string().regex(HEX_COLOR_REGEX);
export type HexColor = z.infer<typeof hexColorSchema>;

export const contrastValueSchema = z
  .union([z.number(), z.string().transform((s) => Number.parseFloat(s))])
  .refine((n) => typeof n === 'number' && !Number.isNaN(n) && n >= 1 && n <= 10);
export type ContrastValue = z.infer<typeof contrastValueSchema>;

// --- Enum / literal schemas ---

export const catalogTypeSchema = z.enum(['manual', 'remote']);
export type CatalogType = z.infer<typeof catalogTypeSchema>;

export const sourceTypeSchema = z.enum(['default']);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const tokenTypeSchema = z.enum(['theme', 'token', 'semantic token']);
export type TokenType = z.infer<typeof tokenTypeSchema>;

export const contrastComparisonMethodSchema = z.enum(['lessThan', 'equalTo', 'greaterThan']);
export type ContrastComparisonMethod = z.infer<typeof contrastComparisonMethodSchema>;

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
  })
  .readonly();
export type Source = z.infer<typeof sourceSchema>;

export const catalogSchema = z
  .object({
    name: catalogNameSchema,
    version: versionSchema,
    type: catalogTypeSchema,
    locked: z.boolean(),
    sources: z.array(sourceSchema).readonly(),
    tokens: z.array(tokenSchema).readonly(),
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
  })
  .readonly();
export type ColorVariable = z.infer<typeof colorVariableSchema>;

export const contrastVariableSchema = z
  .object({
    key: contrastVariableKeySchema,
    comparisonSourceRef: colorVariableKeySchema.nullable(),
  })
  .readonly();
export type ContrastVariable = z.infer<typeof contrastVariableSchema>;

export const mappingSchema = z
  .object({
    token: tokenSchema,
    colorVariableRef: colorVariableKeySchema.nullable(),
    contrastVariableRef: contrastVariableKeySchema.nullable(),
  })
  .readonly();
export type Mapping = z.infer<typeof mappingSchema>;

export const templateSchema = z
  .object({
    name: templateNameSchema,
    version: versionSchema,
    catalogRefs: z.array(catalogReferenceSchema).readonly(),
    mappings: z.array(mappingSchema).readonly(),
    colorVariables: z.array(colorVariableSchema).readonly(),
    contrastVariables: z.array(contrastVariableSchema).readonly(),
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
    templateRef: templateReferenceSchema,
    idePrimaryColorVariableRef: colorVariableKeySchema,
    colorAssignments: z.array(colorAssignmentSchema).readonly(),
    contrastAssignments: z.array(contrastAssignmentSchema).readonly(),
  })
  .readonly();
export type Theme = z.infer<typeof themeSchema>;
