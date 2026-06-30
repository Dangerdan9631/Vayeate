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

/**
 * Applies catalog lifecycle undo to the store as part of undo or theme replay.
 */

@singleton()
export class ApplyCatalogLifecycleUndoOperation {
  constructor(
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly applyCatalogUndoState: ApplyCatalogUndoStateOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  /**
   * Runs apply version deleted for apply catalog lifecycle undo.
   * @param before Before (CatalogLifecycleUndoSnapshot).
   * @param after After (CatalogLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

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

  /**
   * Runs revert version deleted for apply catalog lifecycle undo.
   * @param before Before (CatalogLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  revertVersionDeleted(before: CatalogLifecycleUndoSnapshot): void {
    if (!before.catalog) return;
    this.applyCatalogUndoState.execute(before.catalog);
  }

  /**
   * Runs apply created for apply catalog lifecycle undo.
   * @param after After (CatalogLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  applyCreated(after: CatalogLifecycleUndoSnapshot): void {
    if (!after.catalog) return;
    this.applyCatalogUndoState.execute(after.catalog);
  }

  /**
   * Runs revert created for apply catalog lifecycle undo.
   * @param before Before (CatalogLifecycleUndoSnapshot).
   * @param after After (CatalogLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

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

  /**
   * Runs apply reverted to version for apply catalog lifecycle undo.
   * @param after After (Catalog).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  applyRevertedToVersion(after: Catalog): void {
    this.applyCatalogUndoState.execute(after);
  }

  /**
   * Runs revert reverted to version for apply catalog lifecycle undo.
   * @param before Before (CatalogRevertedToVersionUndoBefore).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

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
