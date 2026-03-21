import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { templateService } from '../../../../gateway/services/template-service';

@injectable()
export class LoadTemplateSnapshot {
  /** Load template from disk without updating state. Single responsibility: read. */
  async execute(name: string, version: string): Promise<Template | null> {
    return templateService.loadTemplate(name, version);
  }
}


