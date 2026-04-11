import { singleton } from 'tsyringe';

@singleton()
export class GenerateSemanticVariantKeyOperation {
  /** Unique placeholder key for an empty semantic variant row. */
  execute(type: string): string {
    return `${type}.empty-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
