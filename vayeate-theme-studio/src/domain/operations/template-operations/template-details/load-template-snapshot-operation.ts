import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';

@injectable()
export class LoadTemplateSnapshotOperation {
  constructor(private readonly templateGateway: TemplateGateway) {}

  /** Load template from disk without updating state. Single responsibility: read. */
  async execute(name: string, version: string): Promise<Template | null> {
    return this.templateGateway.loadTemplate(name, version);
  }
}


