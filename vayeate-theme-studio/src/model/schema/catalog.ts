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

/**
 * Zod schema for one token entry in a catalog.
 */
export const tokenSchema = z
  .object({
    /**
     * Token key validated against `tokenKeySchema`.
     */
    key: tokenKeySchema,
    /**
     * Token category: theme, textmate token, or semantic token.
     */
    type: tokenTypeSchema,
  })
  .readonly();
/**
 * Single catalog token with key and type.
 */
export type Token = z.infer<typeof tokenSchema>;

/**
 * Zod schema for an upstream source that contributes tokens to a catalog.
 */
export const sourceSchema = z
  .object({
    /**
     * URL of the source file or registry endpoint.
     */
    url: urlSchema,
    /**
     * Source format; determines required `tokenType` via cross-field refine.
     */
    type: sourceTypeSchema,
    /**
     * Token category expected from this source; must align with `type`.
     */
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
/**
 * Catalog source URL with format and expected token type.
 */
export type Source = z.infer<typeof sourceSchema>;

/**
 * Zod schema for a semantic token type or modifier name string.
 */
export const semanticTokenTypeOrModifierSchema = z.string();

/**
 * Zod schema for a semantic token language identifier string.
 */
export const semanticTokenLanguageSchema = z.string();

/**
 * Zod schema for a persisted token catalog artifact.
 */
export const catalogSchema = z
  .object({
    /**
     * Catalog artifact name.
     */
    name: catalogNameSchema,
    /**
     * Catalog semantic version.
     */
    version: versionSchema,
    /**
     * Whether the catalog is manual or remote.
     */
    type: catalogTypeSchema,
    /**
     * When true, the catalog cannot be edited in the studio.
     */
    locked: z.boolean(),
    /**
     * Upstream sources that supply tokens; read-only array.
     */
    sources: z.array(sourceSchema).readonly(),
    /**
     * Declared tokens aggregated from sources; read-only array.
     */
    tokens: z.array(tokenSchema).readonly(),
    /**
     * Known semantic token types; defaults to empty when omitted.
     */
    semanticTokenTypes: z.array(semanticTokenTypeOrModifierSchema).readonly().optional().default([]),
    /**
     * Known semantic token modifiers; defaults to empty when omitted.
     */
    semanticTokenModifiers: z.array(semanticTokenTypeOrModifierSchema).readonly().optional().default([]),
    /**
     * Known semantic token languages; defaults to empty when omitted.
     */
    semanticTokenLanguages: z.array(semanticTokenLanguageSchema).readonly().optional().default([]),
  })
  .readonly();
/**
 * Persisted token catalog with sources, tokens, and semantic registry lists.
 */
export type Catalog = z.infer<typeof catalogSchema>;
