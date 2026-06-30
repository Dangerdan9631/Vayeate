import * as z from 'zod';
import {
  catalogNameSchema,
  colorVariableKeySchema,
  contrastVariableKeySchema,
  styleVariableKeySchema,
  templateNameSchema,
  versionSchema,
} from './primitives';
import { semanticTokenLanguageSchema, semanticTokenTypeOrModifierSchema, tokenSchema } from './catalog';

/**
 * Zod schema for a name/version pointer to a catalog artifact.
 */
export const catalogReferenceSchema = z
  .object({
    /**
     * Referenced catalog name.
     */
    name: catalogNameSchema,
    /**
     * Referenced catalog version.
     */
    version: versionSchema,
  })
  .readonly();
/**
 * Catalog artifact reference by name and version.
 */
export type CatalogReference = z.infer<typeof catalogReferenceSchema>;

/**
 * Zod schema for a template color variable definition.
 */
export const colorVariableSchema = z
  .object({
    /**
     * Variable key validated against `colorVariableKeySchema`.
     */
    key: colorVariableKeySchema,
    /**
     * Optional group id for UI grouping; null when ungrouped.
     */
    groupRef: z.string().nullable().optional().default(null),
  })
  .readonly();
/**
 * Template color variable with optional group membership.
 */
export type ColorVariable = z.infer<typeof colorVariableSchema>;

/**
 * Zod schema for a template contrast variable definition.
 */
export const contrastVariableSchema = z
  .object({
    /**
     * Variable key validated against `contrastVariableKeySchema`.
     */
    key: contrastVariableKeySchema,
    /**
     * Color variable key used as the comparison source, or null when unset.
     */
    comparisonSourceRef: colorVariableKeySchema.nullable(),
    /**
     * Optional group id for UI grouping; null when ungrouped.
     */
    groupRef: z.string().nullable().optional().default(null),
  })
  .readonly();
/**
 * Template contrast variable with optional comparison source and group.
 */
export type ContrastVariable = z.infer<typeof contrastVariableSchema>;

/**
 * Zod schema for a template style variable definition.
 */
export const styleVariableSchema = z
  .object({
    /**
     * Variable key validated against `styleVariableKeySchema`.
     */
    key: styleVariableKeySchema,
    /**
     * Optional group id for UI grouping; null when ungrouped.
     */
    groupRef: z.string().nullable().optional().default(null),
  })
  .readonly();
/**
 * Template style variable with optional group membership.
 */
export type StyleVariable = z.infer<typeof styleVariableSchema>;

/**
 * Zod schema for mapping one catalog token to template variables.
 */
export const mappingSchema = z
  .object({
    /**
     * Catalog token being mapped.
     */
    token: tokenSchema,
    /**
     * Linked color variable key, or null when unmapped.
     */
    colorVariableRef: colorVariableKeySchema.nullable(),
    /**
     * Linked contrast variable key, or null when unmapped.
     */
    contrastVariableRef: contrastVariableKeySchema.nullable(),
    /**
     * Linked style variable key, or null when unmapped.
     */
    styleVariableRef: styleVariableKeySchema.nullable().optional(),
    /**
     * When true, this catalog token is intentionally ignored by the template.
     */
    ignored: z.boolean().optional(),
    /**
     * Optional group id for UI grouping; null when ungrouped.
     */
    groupRef: z.string().nullable().optional().default(null),
  })
  .readonly();
/**
 * Token-to-variable mapping with optional group membership.
 */
export type Mapping = z.infer<typeof mappingSchema>;

/**
 * Zod schema for a persisted template artifact.
 */
export const templateSchema = z
  .object({
    /**
     * Template artifact name.
     */
    name: templateNameSchema,
    /**
     * Template semantic version.
     */
    version: versionSchema,
    /**
     * When true, the template cannot be edited in the studio.
     */
    locked: z.boolean(),
    /**
     * Catalogs referenced by this template; read-only array.
     */
    catalogRefs: z.array(catalogReferenceSchema).readonly(),
    /**
     * Token-to-variable mappings; read-only array.
     */
    mappings: z.array(mappingSchema).readonly(),
    /**
     * Declared color variables; read-only array.
     */
    colorVariables: z.array(colorVariableSchema).readonly(),
    /**
     * Declared contrast variables; read-only array.
     */
    contrastVariables: z.array(contrastVariableSchema).readonly(),
    /**
     * Declared style variables; read-only array.
     */
    styleVariables: z.array(styleVariableSchema).readonly().optional(),
    /**
     * Group ids used for organizing variables and mappings; defaults to empty.
     */
    groups: z.array(z.string()).readonly().default([]),
    /**
     * Template-level semantic token modifiers; defaults to empty when omitted.
     */
    semanticTokenModifiers: z.array(semanticTokenTypeOrModifierSchema).readonly().optional().default([]),
    /**
     * Template-level semantic token languages; defaults to empty when omitted.
     */
    semanticTokenLanguages: z.array(semanticTokenLanguageSchema).readonly().optional().default([]),
  })
  .readonly();
/**
 * Persisted template linking catalogs, variables, and token mappings.
 */
export type Template = z.infer<typeof templateSchema>;
