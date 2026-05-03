import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { singleton } from 'tsyringe';
import { getCurrentTemplate, TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

@singleton()
export class SetSelectedTemplateRefOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
  ) {}

  execute(ref: TemplateReference | null): void {
    this.templateUiStore.getStore().selectTemplate(ref);
    this.templateUiStore.getStore().setTemplateLoadState(ref ? 'loading' : 'unloaded');

    if (getCurrentTemplate(this.templatesStore.getStore().state.templates, ref)) {
      this.templateUiStore.getStore().setTemplateLoadState('loaded');
    }
  }
}



