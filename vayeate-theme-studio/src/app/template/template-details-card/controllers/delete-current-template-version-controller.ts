import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../domain/utils/find-nearest-version-ref';
import { DeleteTemplateOperation } from '../../../../domain/operations/template-operations/template-list/delete-template-operation';
import { LoadTemplateOperation } from '../../../../domain/operations/template-operations/template-details/load-template-operation';
import { RefreshTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../../domain/operations/template-operations/template-details/set-template-operation';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import { TEMPLATE_VERSION_DELETED } from '../../../../model/undo-action-types';

/**
 * Handles TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK by deleting the selected version.
 */
@singleton()
export class DeleteCurrentTemplateVersionController {
  constructor(
    private readonly templateUiStore: TemplateUiStore,
    private readonly templatesStore: TemplatesStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly deleteTemplate: DeleteTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Deletes the currently selected template version and updates selection.
   * @returns Resolves when deletion and follow-up selection finish.
   */
  async run(): Promise<void> {
    const selectedRef = this.templateUiStore.getStore().state.selectedRef;
    if (!selectedRef) return;

    const { name, version } = selectedRef;
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, selectedRef);
    if (!template) return;
    const priorSelectedRef = selectedRef;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: priorSelectedRef,
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    this.deleteTemplate.execute(name, version);
    const refs = await this.refreshTemplateRefs.execute();
    const nextT = findNearestVersionRef(refs, name, version);
    const nextRef = nextT ?? null;

    if (nextT) {
      this.setSelectedTemplateRef.execute(nextT);
      await this.loadTemplate.execute(nextT.name, nextT.version);
    } else {
      this.setSelectedTemplateRef.execute(null);
      this.setTemplate.execute(null);
    }

    await this.recordTemplateUndo.execute({
      description: `Delete template ${name}@${version}`,
      actionType: TEMPLATE_VERSION_DELETED,
      target: `${name}@${version}`,
      before: { template, selectedRef: priorSelectedRef },
      after: { template: null, selectedRef: nextRef },
    });
  }
}
