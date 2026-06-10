import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { AddGroupToTemplateOperation } from '../../../../domain/operations/template-operations/groups/add-group-to-template-operation';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { SetTemplateAddGroupNameOperation } from '../../../../domain/operations/template-operations/variables/set-template-add-group-name-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { createUndoProcessor } from '../../../../domain/core/undo-processor';
import { RecordUndoEntryOperation } from '../../../../domain/operations/undo-operations/record-undo-entry-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import {
  TEMPLATE_COLOR_VARIABLE_ADDED,
  TEMPLATE_CONTRAST_VARIABLE_ADDED,
  TEMPLATE_GROUP_ADDED,
} from '../../../../model/undo-action-types';

@singleton()
export class AddGroupAndClearInputController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addGroupToTemplate: AddGroupToTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly setTemplateAddGroupName: SetTemplateAddGroupNameOperation,
    private readonly catalogUiStore?: CatalogUiStore,
    private readonly themeUiStore?: ThemeUiStore,
    private readonly recordUndoEntry?: RecordUndoEntryOperation,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

  async run(): Promise<void> {
    const name = this.templateUiStore.getStore().state.addGroupName.trim();
    if (!name) return;
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.addGroupToTemplate.execute(base, name);
    if (!next) return;

    this.recordContext(template);
    this.applyTemplateState(next);
    this.setTemplateAddGroupName.execute('');

    await this.recordUndoEntry?.execute({
      completed: true,
      description: `Add ${name} template group`,
      diffs: [{
        actionType: TEMPLATE_GROUP_ADDED,
        target: `${template.name}@${template.version}:group:${name}`,
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
          actionType: TEMPLATE_CONTRAST_VARIABLE_ADDED,
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

  private recordContext(template: Template): void {
    if (!this.setCurrentUndoStackId) return;
    const context = deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore?.getStore().state.selectedRef ?? null,
      themeRef: this.themeUiStore?.getStore().state.selectedRef ?? null,
    });
    this.setCurrentUndoStackId.executeForContext(context);
  }

  private applyTemplateState(template: Template): void {
    this.templatesStore.getStore().updateTemplate(template);
    this.templateUiStore.getStore().selectTemplate({ name: template.name, version: template.version });
    this.saveTemplate.execute(template);
    this.refreshTemplateRefsAndSelect.execute(template.name, template.version, template);
  }
}
