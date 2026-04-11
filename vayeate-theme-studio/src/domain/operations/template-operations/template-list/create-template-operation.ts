import type { Template } from '../../../../model/schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { singleton } from 'tsyringe';

@singleton()
export class CreateTemplateOperation {
  constructor(private readonly templateGateway: TemplateGateway) {}

  async execute(params: { name: string }): Promise<Template> {
    const template = await this.templateGateway.createTemplate(params);
    return template;
  }
}



