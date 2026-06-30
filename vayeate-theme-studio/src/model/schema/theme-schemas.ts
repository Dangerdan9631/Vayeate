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
  styleVariableKeySchema,
} from './primitives';
import type { Mapping } from './template-schemas';

/**
 * Zod schema for a name/version pointer to a template artifact.
 */
export const templateReferenceSchema = z
  .object({
    /**
     * Referenced template name.
     */
    name: templateNameSchema,
    /**
     * Referenced template version.
     */
    version: versionSchema,
  })
  .readonly();
/**
 * Template artifact reference by name and version.
 */
export type TemplateReference = z.infer<typeof templateReferenceSchema>;

/**
 * Zod schema for a name/version pointer to a theme artifact.
 */
export const themeReferenceSchema = z
  .object({
    /**
     * Referenced theme name.
     */
    name: themeNameSchema,
    /**
     * Referenced theme version.
     */
    version: versionSchema,
  })
  .readonly();
/**
 * Theme artifact reference by name and version.
 */
export type ThemeReference = z.infer<typeof themeReferenceSchema>;

/**
 * Zod schema for a hex color value assigned to one color scheme side.
 */
export const colorAssignmentValueSchema = z
  .object({
    /**
     * Normalized hex color for this scheme side.
     */
    value: hexColorSchema,
  })
  .readonly();
/**
 * Hex color value for light or dark assignment.
 */
export type ColorAssignmentValue = z.infer<typeof colorAssignmentValueSchema>;

/**
 * Zod schema for color values assigned to a template color variable.
 */
export const colorAssignmentSchema = z
  .object({
    /**
     * Template color variable key receiving the assignment.
     */
    colorRef: colorVariableKeySchema,
    /**
     * Light-scheme hex assignment, or null when unset.
     */
    light: colorAssignmentValueSchema.nullable(),
    /**
     * Dark-scheme hex assignment, or null when unset.
     */
    dark: colorAssignmentValueSchema.nullable(),
    /**
     * When true, dark values are reused for light in the UI and export.
     */
    useDarkForLight: z.boolean(),
  })
  .readonly();
/**
 * Per-variable light and dark color assignments.
 */
export type ColorAssignment = z.infer<typeof colorAssignmentSchema>;

/**
 * Zod schema for contrast ratio settings on one color scheme side.
 */
export const contrastAssignmentValueSchema = z
  .object({
    /**
     * Target contrast ratio from 1 through 10.
     */
    value: contrastValueSchema,
    /**
     * Comparison operator against the reference or bounds.
     */
    comparisonMethod: contrastComparisonMethodSchema,
    /**
     * Optional minimum contrast bound, or null when unused.
     */
    min: contrastValueSchema.nullable(),
    /**
     * Optional maximum contrast bound, or null when unused.
     */
    max: contrastValueSchema.nullable(),
  })
  .readonly();
/**
 * Contrast ratio, comparison method, and optional min/max for one scheme side.
 */
export type ContrastAssignmentValue = z.infer<typeof contrastAssignmentValueSchema>;

/**
 * Zod schema for contrast settings assigned to a template contrast variable.
 */
export const contrastAssignmentSchema = z
  .object({
    /**
     * Template contrast variable key receiving the assignment.
     */
    contrastVariableRef: contrastVariableKeySchema,
    /**
     * Light-scheme contrast settings, or null when unset.
     */
    light: contrastAssignmentValueSchema.nullable(),
    /**
     * Dark-scheme contrast settings, or null when unset.
     */
    dark: contrastAssignmentValueSchema.nullable(),
    /**
     * When true, dark values are reused for light in the UI and export.
     */
    useDarkForLight: z.boolean(),
  })
  .readonly();
/**
 * Per-variable light and dark contrast assignments.
 */
export type ContrastAssignment = z.infer<typeof contrastAssignmentSchema>;

/**
 * Zod schema for text style flags on one color scheme side.
 */
export const styleAssignmentValueSchema = z
  .object({
    /**
     * Whether generated tokens should use bold font weight.
     */
    bold: z.boolean(),
    /**
     * Whether generated tokens should use underline decoration.
     */
    underline: z.boolean(),
    /**
     * Whether generated tokens should use italic font style.
     */
    italic: z.boolean(),
    /**
     * Whether generated tokens should use strikethrough decoration.
     */
    strikethrough: z.boolean(),
  })
  .readonly();
/**
 * Text style flags for light or dark assignment.
 */
export type StyleAssignmentValue = z.infer<typeof styleAssignmentValueSchema>;

/**
 * Zod schema for style settings assigned to a template style variable.
 */
export const styleAssignmentSchema = z
  .object({
    /**
     * Template style variable key receiving the assignment.
     */
    styleVariableRef: styleVariableKeySchema,
    /**
     * Light-scheme style settings, or null when unset.
     */
    light: styleAssignmentValueSchema.nullable(),
    /**
     * Dark-scheme style settings, or null when unset.
     */
    dark: styleAssignmentValueSchema.nullable(),
    /**
     * When true, dark values are reused for light in the UI and export.
     */
    useDarkForLight: z.boolean(),
  })
  .readonly();
/**
 * Per-variable light and dark style assignments.
 */
export type StyleAssignment = z.infer<typeof styleAssignmentSchema>;

/**
 * Zod schema for a persisted theme artifact.
 */
export const themeSchema = z
  .object({
    /**
     * Theme artifact name.
     */
    name: themeNameSchema,
    /**
     * Theme semantic version.
     */
    version: versionSchema,
    /**
     * Linked template reference, or null for a standalone theme.
     */
    templateRef: templateReferenceSchema.nullable(),
    /**
     * Token key driving the IDE primary accent preview; null when unset.
     */
    idePrimaryTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key driving the IDE foreground preview; null when unset.
     */
    ideForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for theme background in the preview; null when unset.
     */
    themeBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for theme foreground in the preview; null when unset.
     */
    themeForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for line number gutter background; null when unset.
     */
    lineNumberBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for line number gutter foreground; null when unset.
     */
    lineNumberForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for active IDE tab chrome; null when unset.
     */
    ideTabTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for IDE tab bar background; null when unset.
     */
    ideTabBarBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for IDE tab bar foreground; null when unset.
     */
    ideTabBarForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for editor preview scrollbar track; null when unset.
     */
    editorPreviewScrollbarBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for editor preview scrollbar thumb; null when unset.
     */
    editorPreviewScrollbarForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for editor preview selection highlight; null when unset.
     */
    editorPreviewSelectionBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for editor preview menu text; null when unset.
     */
    editorPreviewMenuForegroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Token key for editor preview menu background; null when unset.
     */
    editorPreviewMenuBackgroundTokenRef: tokenKeySchema.nullable().optional().default(null),
    /**
     * Color variable assignments; read-only array.
     */
    colorAssignments: z.array(colorAssignmentSchema).readonly(),
    /**
     * Contrast variable assignments; read-only array.
     */
    contrastAssignments: z.array(contrastAssignmentSchema).readonly(),
    /**
     * Style variable assignments; read-only array.
     */
    styleAssignments: z.array(styleAssignmentSchema).readonly().optional(),
    /**
     * When true, palette clustering applies to dark assignments; defaults to true.
     */
    applyPaletteToDark: z.boolean().optional().default(true),
    /**
     * When true, palette clustering applies to light assignments; defaults to true.
     */
    applyPaletteToLight: z.boolean().optional().default(true),
    /**
     * Number of palette clusters (k) from 1 through 12; defaults to 5.
     */
    paletteClusterCountK: z.number().min(1).max(12).optional().default(5),
    /**
     * Group ids included in palette clustering; defaults to empty.
     */
    paletteClusterGroupIds: z.array(z.string()).readonly().optional().default([]),
  })
  .readonly();
/**
 * Persisted theme with template link, preview token refs, assignments, and palette settings.
 */
export type Theme = z.infer<typeof themeSchema>;

/**
 * Property names on `Theme` that hold IDE preview token key references.
 */
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

/**
 * Outcome of merging template mappings into a theme draft.
 */
export interface MergeMappingsResult {
  /**
   * Combined token mappings after merge.
   */
  mappings: Mapping[];
  /**
   * Group ids that must exist on the target template.
   */
  groupsToEnsure: string[];
  /**
   * Semantic token modifiers contributed by merged catalogs.
   */
  semanticTokenModifiers: string[];
  /**
   * Semantic token languages contributed by merged catalogs.
   */
  semanticTokenLanguages: string[];
}
