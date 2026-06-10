import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';
import type {
  CatalogLifecycleUndoSnapshot,
  CatalogRevertedToVersionUndoBefore,
} from '../../../model/catalog-undo-lifecycle';
import { DeleteCatalogOperation } from '../../catalog/operations/delete-catalog-operation';
import { LoadCatalogRefsOperation } from '../../catalog/operations/load-catalog-refs-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../delete/refresh-catalog-refs-and-select-operation';
import { SetSelectedCatalogOperation } from '../delete/set-selected-catalog-operation';
import { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';

@singleton()
export class ApplyCatalogLifecycleUndoOperation {
  constructor(
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly applyCatalogUndoState: ApplyCatalogUndoStateOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  applyVersionDeleted(before: CatalogLifecycleUndoSnapshot, after: CatalogLifecycleUndoSnapshot): void {
    const catalog = before.catalog;
    if (!catalog) return;
    this.deleteCatalog.execute(catalog.name, catalog.version)
      .then('Refresh catalog refs after redo delete', () => {
        this.loadCatalogRefs.execute().then('Select catalog after redo delete', () => {
          this.setSelectedCatalog.execute(after.selectedRef);
        });
      });
  }

  revertVersionDeleted(before: CatalogLifecycleUndoSnapshot): void {
    if (!before.catalog) return;
    this.applyCatalogUndoState.execute(before.catalog);
  }

  applyCreated(after: CatalogLifecycleUndoSnapshot): void {
    if (!after.catalog) return;
    this.applyCatalogUndoState.execute(after.catalog);
  }

  revertCreated(before: CatalogLifecycleUndoSnapshot, after: CatalogLifecycleUndoSnapshot): void {
    const catalog = after.catalog;
    if (!catalog) return;
    this.deleteCatalog.execute(catalog.name, catalog.version)
      .then('Refresh catalog refs after undo create', () => {
        this.loadCatalogRefs.execute().then('Restore selection after undo create', () => {
          this.setSelectedCatalog.execute(before.selectedRef);
        });
      });
  }

  applyRevertedToVersion(after: Catalog): void {
    this.applyCatalogUndoState.execute(after);
  }

  revertRevertedToVersion(before: CatalogRevertedToVersionUndoBefore): void {
    this.deleteCatalog.execute(before.deleteVersion.name, before.deleteVersion.version)
      .then('Refresh catalog refs after undo revert', () => {
        this.refreshCatalogRefsAndSelect.execute(
          before.selectedRef.name,
          before.selectedRef.version,
        );
      });
  }
}
