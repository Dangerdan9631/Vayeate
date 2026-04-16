import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class LoadTemplateOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateGateway: TemplateGateway,
  ) {}

  async execute(name: string, version: string): Promise<Template | null> {
    const loaded = await this.templateGateway.loadTemplate(name, version);
    this.templatesStore.getStore().setTemplate(loaded);
    return loaded;
  }
}



