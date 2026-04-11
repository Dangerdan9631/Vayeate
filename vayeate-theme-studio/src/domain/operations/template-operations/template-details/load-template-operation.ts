import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@singleton()
export class LoadTemplateOperation {
  constructor(
    private readonly TemplatesStateSetter: TemplatesStateSetter,
    private readonly templateGateway: TemplateGateway,
  ) {}

  async execute(name: string, version: string): Promise<Template | null> {
    const loaded = await this.templateGateway.loadTemplate(name, version);
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE', template: loaded });
    return loaded;
  }
}



