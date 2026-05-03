import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { LockTemplateOperation as LockTemplateOperation } from '../../../../domain/operations/template-operations/template-details/lock-template-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { ValidateCanLockTemplate } from '../../../../domain/validations/template-validations/validate-can-lock-template';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class LockTemplateController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly lockTemplateOperation: LockTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly validateCanLockTemplate: ValidateCanLockTemplate,
  ) {}

  run(): void {
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template || !this.validateCanLockTemplate.test(template)) return;
    const updated = this.lockTemplateOperation.execute(template);
    this.saveTemplate.execute(updated);
    this.refreshTemplateRefsAndSelect.execute(template.name, template.version);
  }
}
