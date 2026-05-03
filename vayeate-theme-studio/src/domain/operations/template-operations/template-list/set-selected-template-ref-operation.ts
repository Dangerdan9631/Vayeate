import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetSelectedTemplateRefOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(ref: TemplateReference | null): void {
    this.templatesStore.getStore().selectTemplate(ref);
  }
}



