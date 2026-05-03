import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateRefsOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(refs: TemplateReference[]): void {
    this.templatesStore.getStore().updateTemplateRefs(refs);
  }
}
