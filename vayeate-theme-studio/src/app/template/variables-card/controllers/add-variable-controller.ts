import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
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
import { createUndoProcessor } from '../../../../domain/core/undo-processor';
import { RecordUndoEntryOperation } from '../../../../domain/operations/undo-operations/record-undo-entry-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';

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
    private readonly recordUndoEntry: RecordUndoEntryOperation,
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

    const context = deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    });
    this.setCurrentUndoStackId.executeForContext(context);

    const base = this.bumpTemplateVersionForEdit.execute(template);
    let next;
    let actionType: string;
    if (variableKind === 'contrast') {
      next = this.addContrastVariableToTemplate.execute(base, key, groupRef);
      actionType = 'TEMPLATE_CONTRAST_VARIABLE_ADDED';
    } else {
      next = this.addColorVariableToTemplate.execute(base, key, groupRef);
      actionType = 'TEMPLATE_COLOR_VARIABLE_ADDED';
    }
    this.applyTemplateState(next);
    this.setTemplateAddVariableName.execute('');

    await this.recordUndoEntry.execute({
      completed: true,
      description: `Add ${key} ${variableKind} variable`,
      diffs: [{
        actionType,
        target: `${template.name}@${template.version}:${variableKind}-variable:${key}`,
        before: template,
        after: next,
      }],
      processor: createUndoProcessor([
        {
          actionType: 'TEMPLATE_COLOR_VARIABLE_ADDED',
          apply: (action) => this.applyTemplateState(action.after as Template),
          revert: (action) => this.applyTemplateState(action.before as Template),
        },
        {
          actionType: 'TEMPLATE_CONTRAST_VARIABLE_ADDED',
          apply: (action) => this.applyTemplateState(action.after as Template),
          revert: (action) => this.applyTemplateState(action.before as Template),
        },
        {
          actionType: 'TEMPLATE_GROUP_ADDED',
          apply: (action) => this.applyTemplateState(action.after as Template),
          revert: (action) => this.applyTemplateState(action.before as Template),
        },
      ]),
    });
  }

  private applyTemplateState(template: Template): void {
    this.templatesStore.getStore().updateTemplate(template);
    this.templateUiStore.getStore().selectTemplate({ name: template.name, version: template.version });
    this.saveTemplate.execute(template);
    this.refreshTemplateRefsAndSelect.execute(template.name, template.version, template);
  }
}
