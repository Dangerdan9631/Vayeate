import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplateService } from '../../../../gateway/services/template-service';

@injectable()
export class LoadTemplateSnapshot {
  constructor(private readonly templateService: TemplateService) {}

  /** Load template from disk without updating state. Single responsibility: read. */
  async execute(name: string, version: string): Promise<Template | null> {
    return this.templateService.loadTemplate(name, version);
  }
}


