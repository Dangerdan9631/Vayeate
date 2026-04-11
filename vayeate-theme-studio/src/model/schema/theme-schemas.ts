import * as z from 'zod';
import {
  contrastComparisonMethodSchema,
  contrastValueSchema,
  hexColorSchema,
  templateNameSchema,
  themeNameSchema,
  tokenKeySchema,
  versionSchema,
  colorVariableKeySchema,
  contrastVariableKeySchema,
} from './primitives';
import type { Mapping } from './template-schemas';

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
    applyPaletteToDark: z.boolean().optional().default(true),
    applyPaletteToLight: z.boolean().optional().default(true),
    paletteClusterCountK: z.number().min(1).max(12).optional().default(5),
    paletteClusterGroupIds: z.array(z.string()).readonly().optional().default([]),
  })
  .readonly();
export type Theme = z.infer<typeof themeSchema>;

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

export interface MergeMappingsResult {
  mappings: Mapping[];
  groupsToEnsure: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
}
