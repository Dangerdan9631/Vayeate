import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';

/** Delete one template version from disk. Single responsibility: delete. */
@singleton()
export class DeleteTemplateOperation {
  constructor(private readonly templateGateway: TemplateGateway) {}

  async execute(name: string, version: string): Promise<void> {
    await this.templateGateway.deleteTemplate(name, version);
  }
}
