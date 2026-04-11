import * as z from 'zod';
import {
  catalogNameSchema,
  catalogTypeSchema,
  sourceTypeSchema,
  tokenKeySchema,
  tokenTypeSchema,
  urlSchema,
  versionSchema,
} from './primitives';

export const tokenSchema = z
  .object({
    key: tokenKeySchema,
    type: tokenTypeSchema,
  })
  .readonly();
export type Token = z.infer<typeof tokenSchema>;

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

export const semanticTokenTypeOrModifierSchema = z.string();
export const semanticTokenLanguageSchema = z.string();

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
