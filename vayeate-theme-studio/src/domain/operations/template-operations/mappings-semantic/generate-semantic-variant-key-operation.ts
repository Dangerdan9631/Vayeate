import { singleton } from 'tsyringe';

/**
 * Generates semantic variant key and stores the result.
 */

@singleton()
export class GenerateSemanticVariantKeyOperation {
  /**
   * Builds a unique placeholder key for an empty semantic variant row.
   * @param type Semantic token type prefix for the generated key.
   * @returns Unique variant key string.
   */
  execute(type: string): string {
    return `${type}.empty-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
