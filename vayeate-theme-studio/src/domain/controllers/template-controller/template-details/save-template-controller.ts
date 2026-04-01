import type { Template } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SaveTemplateOperation } from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class SaveTemplateController {
  constructor(
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(template: Template): Promise<void> {
    await this.saveTemplate.execute(template);
    await this.templateSharedFlows.refreshRefsAndSelect(template.name, template.version);
  }
}
