import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';

@injectable()
export class SaveTemplateOperation {
  constructor(private readonly templateGateway: TemplateGateway) {}

  /** Persist template to disk only. Single responsibility: save. */
  async execute(template: Template): Promise<void> {
    await this.templateGateway.saveTemplate(template);
  }
}


