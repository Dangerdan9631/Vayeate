import { singleton } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../../domain/state/ui/create-template-dialog-store';
import { CreateTemplateOperation } from '../../../../domain/operations/template-operations/template-list/create-template-operation';
import { RefreshTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../../domain/operations/template-operations/template-details/set-template-operation';
import { SetTemplateCreateDialogOpenOperation } from '../../../../domain/operations/template-operations/template-list/set-template-create-dialog-open-operation';
import { SetTemplateIsCreatingOperation } from '../../../../domain/operations/template-operations/template-list/set-template-is-creating-operation';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import { TEMPLATE_CREATED } from '../../../../model/undo-action-types';

/**
 * Handles TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK by creating a new template.
 */
@singleton()
export class CreateTemplateController {
  constructor(
    private readonly createTemplateDialogStore: CreateTemplateDialogStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly createTemplate: CreateTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation,
    private readonly setTemplateIsCreating: SetTemplateIsCreatingOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Creates a template from the dialog name, selects it, and records undo.
   * @returns Resolves when creation and follow-up selection finish.
   */
  async run(): Promise<void> {
    const name = this.createTemplateDialogStore.getStore().state?.name.trim();
    if (!name) return;

    const priorSelectedRef = this.templateUiStore.getStore().state.selectedRef;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: priorSelectedRef,
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    this.setTemplateIsCreating.execute(true);
    this.setTemplateCreateDialogOpen.execute(false);
    try {
      const newTemplate = await this.createTemplate.execute({ name });
      this.refreshTemplateRefs.execute();
      this.setTemplate.execute(newTemplate);
      const ref = { name: newTemplate.name, version: newTemplate.version };
      this.setSelectedTemplateRef.execute(ref);

      await this.recordTemplateUndo.execute({
        description: `Create template ${name}`,
        actionType: TEMPLATE_CREATED,
        target: `${name}@${newTemplate.version}`,
        before: { template: null, selectedRef: priorSelectedRef },
        after: { template: newTemplate, selectedRef: ref },
      });
    } finally {
      this.setTemplateIsCreating.execute(false);
    }
  }
}
