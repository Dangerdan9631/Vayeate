import type { Template } from '../../../../model/schemas';
import { TemplateService } from '../../../../gateway/services/template-service';
import { injectable } from 'tsyringe';

@injectable()
export class CreateTemplate {
  constructor(private readonly templateService: TemplateService) {}

  async execute(params: { name: string }): Promise<Template> {
    const template = await this.templateService.createTemplate(params);
    return template;
  }
}



