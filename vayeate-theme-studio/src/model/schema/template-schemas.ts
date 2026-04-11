import * as z from 'zod';
import {
  catalogNameSchema,
  colorVariableKeySchema,
  contrastVariableKeySchema,
  templateNameSchema,
  versionSchema,
} from './primitives';
import { semanticTokenLanguageSchema, semanticTokenTypeOrModifierSchema, tokenSchema } from './catalog';

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
