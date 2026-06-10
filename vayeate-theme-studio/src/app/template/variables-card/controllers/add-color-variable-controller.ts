import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { AddColorVariableOperation as AddColorVariableOp } from '../../../../domain/operations/template-operations/variables-color/add-color-variable-operation';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { createUndoProcessor } from '../../../../domain/core/undo-processor';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordUndoEntryOperation } from '../../../../domain/operations/undo-operations/record-undo-entry-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import {
  TEMPLATE_COLOR_VARIABLE_ADDED,
  TEMPLATE_GROUP_ADDED,
} from '../../../../model/undo-action-types';

@singleton()
export class AddColorVariableController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addColorVariableToTemplate: AddColorVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(key: string, groupRef?: string | null): Promise<void> {
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template) return;
    const trimmedKey = key.trim();
    if (!trimmedKey || template.colorVariables.some((variable) => variable.key === trimmedKey)) return;

    const context = deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    });
    this.setCurrentUndoStackId.executeForContext(context);

    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.addColorVariableToTemplate.execute(base, trimmedKey, groupRef);
    this.applyTemplateState(next);

    await this.recordUndoEntry.execute({
      completed: true,
      description: `Add ${trimmedKey} color variable`,
      diffs: [{
        actionType: TEMPLATE_COLOR_VARIABLE_ADDED,
        target: `${template.name}@${template.version}:color-variable:${trimmedKey}`,
        before: template,
        after: next,
      }],
      processor: createUndoProcessor([
        {
          actionType: TEMPLATE_COLOR_VARIABLE_ADDED,
          apply: (action) => this.applyTemplateState(action.after as Template),
          revert: (action) => this.applyTemplateState(action.before as Template),
        },
        {
          actionType: TEMPLATE_GROUP_ADDED,
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
