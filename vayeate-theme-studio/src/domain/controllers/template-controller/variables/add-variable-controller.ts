import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { AddColorVariableOperation as AddColorVariableOp } from '../../../operations/template-operations/variables-color/add-color-variable-operation';
import { AddContrastVariableOperation as AddContrastVariableOp } from '../../../operations/template-operations/variables-contrast/add-contrast-variable-operation';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { SetTemplateAddVariableNameOperation } from '../../../operations/template-operations/variables/set-template-add-variable-name-operation';

@singleton()
export class AddVariableController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addColorVariableToTemplate: AddColorVariableOp,
    private readonly addContrastVariableToTemplate: AddContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation,
  ) {}

  run(groupRef: string | null, variableKind: 'color' | 'contrast'): void {
    const key = this.templatesStore.getStore().state.addVariableName.trim();
    if (!key) return;
    const template = this.templatesStore.getStore().state.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    let next;
    if (variableKind === 'contrast') {
      next = this.addContrastVariableToTemplate.execute(base, key, groupRef);
    } else {
      next = this.addColorVariableToTemplate.execute(base, key, groupRef);
    }
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
    this.setTemplateAddVariableName.execute('');
  }
}
