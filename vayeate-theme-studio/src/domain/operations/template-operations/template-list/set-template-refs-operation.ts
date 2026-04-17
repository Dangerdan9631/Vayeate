import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateRefsOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(refs: TemplateReference[]): void {
    this.templatesStore.getStore().setTemplateMapEntries(
      refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    );
  }
}
