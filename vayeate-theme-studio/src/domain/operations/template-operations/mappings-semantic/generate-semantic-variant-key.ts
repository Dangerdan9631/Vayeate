/** Unique placeholder key for an empty semantic variant row. */
export function generateSemanticVariantKey(type: string): string {
  return `${type}.empty-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
