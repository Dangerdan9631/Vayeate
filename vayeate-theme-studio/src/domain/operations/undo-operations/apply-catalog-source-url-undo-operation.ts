import { singleton } from 'tsyringe';
import type { CatalogSourceFieldUndoValue } from '../../../model/catalog-source-undo';
import { getCurrentCatalog } from '../../catalog/state/catalogs-store';
import { CatalogsStore } from '../../catalog/state/catalogs-store';
import { CatalogUiStore } from '../../state/ui/catalog-ui-store';
import { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';

/**
 * Applies a catalog source URL undo patch through the standard persist and selection path.
 */
@singleton()
export class ApplyCatalogSourceUrlUndoOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly applyCatalogUndoState: ApplyCatalogUndoStateOperation,
  ) {}

  /**
   * Runs the apply catalog source URL undo mutation.
   * @param patch Source field patch to apply to the current catalog.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */
  execute(patch: CatalogSourceFieldUndoValue): void {
    const store = this.catalogsStore.getStore();
    const selectedRef = this.catalogUiStore.getStore().state.selectedRef;
    const catalog = selectedRef ? getCurrentCatalog(store.state.catalogs, selectedRef) : null;
    if (!catalog) return;

    const sources = catalog.sources.map((source, index) =>
      index === patch.sourceIndex ? { ...source, url: patch.value.trim() } : source,
    );
    this.applyCatalogUndoState.execute({ ...catalog, sources });
  }
}
