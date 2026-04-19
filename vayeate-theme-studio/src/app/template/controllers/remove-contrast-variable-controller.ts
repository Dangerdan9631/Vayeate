import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../domain/state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveContrastVariableOperation as RemoveContrastVariableOp } from '../../../domain/operations/template-operations/variables-contrast/remove-contrast-variable-operation';
import { SaveTemplateOperation } from '../../../domain/operations/template-operations/template-details/save-template-operation';
import { referencedContrastVarKeysFromTemplate } from '../../../domain/utils/referenced-contrast-var-keys-from-template';
import { RefreshTemplateRefsAndSelectOperation } from '../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class RemoveContrastVariableController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeContrastVariableFromTemplate: RemoveContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  run(key: string): void {
    const template = this.templatesStore.getStore().state.template;
    if (!template) return;
    const refs = referencedContrastVarKeysFromTemplate(template);
    if (refs.has(key)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeContrastVariableFromTemplate.execute(base, key);
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
