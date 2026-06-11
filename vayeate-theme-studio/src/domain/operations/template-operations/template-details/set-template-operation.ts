import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Updates template in the domain or UI store.
 */

@singleton()
export class SetTemplateOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
  ) {}

  /**
   * Runs the set template mutation.
   * @param template Template (Template | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(template: Template | null): void {
    if (!template) {
      this.templateUiStore.getStore().selectTemplate(null);
      this.templateUiStore.getStore().setTemplateLoadState('unloaded');
      return;
    }
    this.templatesStore.getStore().updateTemplate(template);
    const selectedRef = this.templateUiStore.getStore().state.selectedRef;
    if (selectedRef?.name === template.name && selectedRef.version === template.version) {
      this.templateUiStore.getStore().setTemplateLoadState('loaded');
    }
  }
}


