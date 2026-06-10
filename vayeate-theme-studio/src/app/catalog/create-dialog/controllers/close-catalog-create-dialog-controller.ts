import { singleton } from 'tsyringe';
import { CloseCatalogCreateDialogOperation } from '../../../../domain/operations/create-dialog/operations/close-catalog-create-dialog-operation';
import { CreateCatalogOperation } from '../../../../domain/catalog/operations/create-catalog-operation';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/delete/set-selected-catalog-operation';
import { CreateCatalogDialogStore } from '../../../../domain/state/ui/create-catalog-dialog-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { CatalogsStore, getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import type { DialogResultOkCancel } from '../../../../model/dialog-result';
import { deriveUndoContext } from '../../../../model/undo-history';
import { CATALOG_CREATED } from '../../../../model/undo-action-types';

export type CatalogCreateDialogOutcome = 'OK' | 'Cancel';

function toDialogResult(outcome: CatalogCreateDialogOutcome): DialogResultOkCancel {
  return outcome === 'OK' ? 'OK' : 'CANCEL';
}

@singleton()
export class CloseCatalogCreateDialogController {
  constructor(
    private readonly createCatalogDialogStore: CreateCatalogDialogStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly catalogsStore: CatalogsStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialogOperation,
    private readonly createCatalog: CreateCatalogOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  run(outcome: CatalogCreateDialogOutcome): void {
    this.closeCatalogCreateDialog.execute(toDialogResult(outcome));

    if (outcome !== 'OK') return;

    const store = this.createCatalogDialogStore.getStore().state;
    if (!store) return;

    const priorSelectedRef = this.catalogUiStore.getStore().state.selectedRef;
    const catalogName = store.name.trim();

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: priorSelectedRef,
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const ref = this.createCatalog.execute({ name: catalogName, type: store.type });
    const createdCatalog = getCurrentCatalog(this.catalogsStore.getStore().state.catalogs, ref);
    if (!createdCatalog) return;

    this.setSelectedCatalog.execute(ref);

    void this.recordCatalogUndo.execute({
      description: `Create catalog ${catalogName}`,
      actionType: CATALOG_CREATED,
      target: `${catalogName}@1.0.0`,
      before: { catalog: null, selectedRef: priorSelectedRef },
      after: { catalog: createdCatalog, selectedRef: ref },
    });
  }
}
