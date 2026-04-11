import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { LockTemplateOperation as LockTemplateOperation, SaveTemplateOperation } from '../../../operations/template-operations';
import { ValidateCanLockTemplate } from '../../../validations/template-validations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class LockTemplateController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly lockTemplateOperation: LockTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly validateCanLockTemplate: ValidateCanLockTemplate,
  ) {}

  async run(): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template || !this.validateCanLockTemplate.test(template)) return;
    const updated = this.lockTemplateOperation.execute(template);
    await this.saveTemplate.execute(updated);
    await this.refreshTemplateRefsAndSelect.execute(template.name, template.version);
  }
}
