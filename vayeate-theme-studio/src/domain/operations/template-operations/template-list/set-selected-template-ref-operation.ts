import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

@singleton()
export class SetSelectedTemplateRefOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(ref: TemplateReference | null): void {
    this.templateUiStore.getStore().selectTemplate(ref);
  }
}



