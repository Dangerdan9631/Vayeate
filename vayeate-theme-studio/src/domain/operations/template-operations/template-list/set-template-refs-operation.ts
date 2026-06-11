import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/data/templates-store';

/**
 * Updates template refs in the domain or UI store.
 */

@singleton()
export class SetTemplateRefsOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  /**
   * Runs the set template refs mutation.
   * @param refs Refs (TemplateReference[]).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(refs: TemplateReference[]): void {
    this.templatesStore.getStore().updateTemplateRefs(refs);
  }
}
