import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { UpdateVariableGroupRefOperation as UpdateVariableGroupRefOp } from '../../../../domain/operations/template-operations/variables/update-variable-group-ref-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import { TEMPLATE_VARIABLE_GROUP_REF_UPDATED } from '../../../../model/undo-action-types';

@singleton()
export class UpdateVariableGroupRefController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly updateVariableGroupRefOp: UpdateVariableGroupRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  run(variableKey: string, groupRef: string | null): void {
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.updateVariableGroupRefOp.execute(base, variableKey, groupRef);
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version, next, entityRefsChanged(template, next));

    void this.recordTemplateUndo.execute({
      description: `Set ${variableKey} group`,
      actionType: TEMPLATE_VARIABLE_GROUP_REF_UPDATED,
      target: `${template.name}@${template.version}:variable:${variableKey}:group`,
      before: template,
      after: next,
    });
  }
}
