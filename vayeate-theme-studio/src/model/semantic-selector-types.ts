import { z } from 'zod';

export const semanticSelectorSegmentSchema = z.string().regex(/^[a-zA-Z*][a-zA-Z0-9_*-]*$/);

export const parsedSemanticSelectorSchema = z.object({
  type: z.union([z.literal(''), semanticSelectorSegmentSchema]),
  modifiers: z.array(semanticSelectorSegmentSchema),
  language: semanticSelectorSegmentSchema.nullable(),
}).superRefine((value, ctx) => {
  if (value.type === '' && value.modifiers.length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Semantic selector modifiers require a selector type.',
      path: ['modifiers'],
    });
  }

  if (value.type === '' && value.language !== null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Semantic selector language requires a selector type.',
      path: ['language'],
    });
  }
});

export type ParsedSemanticSelector = z.infer<typeof parsedSemanticSelectorSchema>;

export interface SemanticCatalogArrays {
  types: readonly string[];
  modifiers: readonly string[];
  languages: readonly string[];
}
