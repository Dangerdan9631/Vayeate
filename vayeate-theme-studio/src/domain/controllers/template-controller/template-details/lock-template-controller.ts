import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { LockTemplateOperation as LockTemplateOperation, SaveTemplateOperation } from '../../../operations/template-operations';
import { canLockTemplate } from '../../../validations/template-validations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class LockTemplateController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly lockTemplateOperation: LockTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!canLockTemplate(template)) return;
    const updated = this.lockTemplateOperation.execute(template);
    await this.saveTemplate.execute(updated);
    await this.templateSharedFlows.refreshRefsAndSelect(template.name, template.version);
  }
}
