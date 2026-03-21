import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { templateService } from '../../../../gateway/services/template-service';

@injectable()
export class SaveTemplate {
  /** Persist template to disk only. Single responsibility: save. */
  async execute(template: Template): Promise<void> {
    await templateService.saveTemplate(template);
  }
}


