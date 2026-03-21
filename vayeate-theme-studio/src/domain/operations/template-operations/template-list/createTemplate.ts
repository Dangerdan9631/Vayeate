import type { Template } from '../../../../model/schemas';
import { templateService } from '../../../../gateway/services/template-service';
import { injectable } from 'tsyringe';

@injectable()
export class CreateTemplate {
  async execute(params: { name: string }): Promise<Template> {
    const template = await templateService.createTemplate(params);
    return template;
  }
}



