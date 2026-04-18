import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { LockTemplateOperation as LockTemplateOperation } from '../../../operations/template-operations/template-details/lock-template-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { ValidateCanLockTemplate } from '../../../validations/template-validations/validate-can-lock-template';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class LockTemplateController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly lockTemplateOperation: LockTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly validateCanLockTemplate: ValidateCanLockTemplate,
  ) {}

  run(): void {
    const template = this.templatesStore.getStore().state.template;
    if (!template || !this.validateCanLockTemplate.test(template)) return;
    const updated = this.lockTemplateOperation.execute(template);
    this.saveTemplate.execute(updated);
    this.refreshTemplateRefsAndSelect.execute(template.name, template.version);
  }
}
