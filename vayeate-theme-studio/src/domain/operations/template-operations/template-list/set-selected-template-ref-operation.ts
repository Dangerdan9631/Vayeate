import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { singleton } from 'tsyringe';
import { getCurrentTemplate, TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Updates selected template ref in the domain or UI store.
 */

@singleton()
export class SetSelectedTemplateRefOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
  ) {}

  /**
   * Runs the set selected template ref mutation.
   * @param ref Ref (TemplateReference | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(ref: TemplateReference | null): void {
    this.templateUiStore.getStore().selectTemplate(ref);
    this.templateUiStore.getStore().setTemplateLoadState(ref ? 'loading' : 'unloaded');

    if (getCurrentTemplate(this.templatesStore.getStore().state.templates, ref)) {
      this.templateUiStore.getStore().setTemplateLoadState('loaded');
    }
  }
}



