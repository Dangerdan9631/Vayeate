import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../domain/utils/find-nearest-version-ref';
import { DeleteCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-list/delete-catalog-operation';
import { RefreshCatalogRefsOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-operation';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class DeleteCurrentCatalogVersionController {
  constructor(
    private readonly catalogUiStore: CatalogUiStore,
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly refreshCatalogRefs: RefreshCatalogRefsOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
  ) {}

  async run(): Promise<void> {
    const ref = this.catalogUiStore.getStore().state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    this.deleteCatalog.execute(name, version);
    const refs = await this.refreshCatalogRefs.execute();
    const next = findNearestVersionRef(refs, name, version);

    if (next) {
      this.setSelectedCatalog.execute(next);
    } else {
      this.setSelectedCatalog.execute(null);
    }
  }
}
