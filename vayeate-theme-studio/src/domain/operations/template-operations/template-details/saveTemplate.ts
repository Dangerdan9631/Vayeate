import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplateService } from '../../../../gateway/services/template-service';

@injectable()
export class SaveTemplate {
  constructor(private readonly templateService: TemplateService) {}

  /** Persist template to disk only. Single responsibility: save. */
  async execute(template: Template): Promise<void> {
    await this.templateService.saveTemplate(template);
  }
}


