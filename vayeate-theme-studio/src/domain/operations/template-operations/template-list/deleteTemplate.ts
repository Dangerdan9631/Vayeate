import { templateService } from '../../../../gateway/services/template-service';

/** Delete one template version from disk. Single responsibility: delete. */
import { injectable } from 'tsyringe';

@injectable()
export class DeleteTemplate {
  /** Delete one template version from disk. Single responsibility: delete. */
  async execute(name: string, version: string): Promise<void> {
    await templateService.deleteTemplate(name, version);
  }
}


