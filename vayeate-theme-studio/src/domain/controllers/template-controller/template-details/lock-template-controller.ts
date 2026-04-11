import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { LockTemplateOperation as LockTemplateOperation } from '../../../operations/template-operations/template-details/lock-template-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { ValidateCanLockTemplate } from '../../../validations/template-validations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

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
