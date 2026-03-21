import { injectable } from 'tsyringe';
import { TemplateService } from '../../../../gateway/services/template-service';

/** Delete one template version from disk. Single responsibility: delete. */
@injectable()
export class DeleteTemplate {
  constructor(private readonly templateService: TemplateService) {}

  async execute(name: string, version: string): Promise<void> {
    await this.templateService.deleteTemplate(name, version);
  }
}
