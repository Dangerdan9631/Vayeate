import type { TemplateReference } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetSelectedTemplateRefOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(ref: TemplateReference | null): void {
    this.templatesStore.getStore().setSelectedRef(ref);
  }
}



