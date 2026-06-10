import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { AddColorVariableOperation as AddColorVariableOp } from '../../../../domain/operations/template-operations/variables-color/add-color-variable-operation';
import { AddContrastVariableOperation as AddContrastVariableOp } from '../../../../domain/operations/template-operations/variables-contrast/add-contrast-variable-operation';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { SetTemplateAddVariableNameOperation } from '../../../../domain/operations/template-operations/variables/set-template-add-variable-name-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import {
  TEMPLATE_COLOR_VARIABLE_ADDED,
  TEMPLATE_CONTRAST_VARIABLE_ADDED,
} from '../../../../model/undo-action-types';

@singleton()
export class AddVariableController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addColorVariableToTemplate: AddColorVariableOp,
    private readonly addContrastVariableToTemplate: AddContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(groupRef: string | null, variableKind: 'color' | 'contrast'): Promise<void> {
    const key = this.templateUiStore.getStore().state.addVariableName.trim();
    if (!key) return;
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template) return;
    const existingKeys = variableKind === 'contrast'
      ? template.contrastVariables.map((variable) => variable.key)
      : template.colorVariables.map((variable) => variable.key);
    if (existingKeys.includes(key)) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpTemplateVersionForEdit.execute(template);
    let next;
    let actionType: string;
    if (variableKind === 'contrast') {
      next = this.addContrastVariableToTemplate.execute(base, key, groupRef);
      actionType = TEMPLATE_CONTRAST_VARIABLE_ADDED;
    } else {
      next = this.addColorVariableToTemplate.execute(base, key, groupRef);
      actionType = TEMPLATE_COLOR_VARIABLE_ADDED;
    }
    this.templatesStore.getStore().updateTemplate(next);
    this.templateUiStore.getStore().selectTemplate({ name: next.name, version: next.version });
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version, next);
    this.setTemplateAddVariableName.execute('');

    await this.recordTemplateUndo.execute({
      description: `Add ${key} ${variableKind} variable`,
      actionType,
      target: `${template.name}@${template.version}:${variableKind}-variable:${key}`,
      before: template,
      after: next,
    });
  }
}
