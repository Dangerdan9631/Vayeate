import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

/**
 * Sets the catalog pane selection: selected ref and loaded catalog in app state.
 * When `catalog` is omitted, reads the catalog from the catalog map entry for `ref` (must be loaded).
 */
@singleton()
export class SetSelectedCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
  ) {}

  execute(ref: CatalogReference | null, catalog?: Catalog | null): void {
    if (ref === null) {
      this.catalogsStore.getStore().setSelectedRef(null);
      this.catalogsStore.getStore().setCatalog(null);
      return;
    }

    if (catalog !== undefined) {
      this.catalogsStore.getStore().setSelectedRef(ref);
      this.catalogsStore.getStore().setCatalog(catalog);
      return;
    }

    const fromMap = this.catalogsStore.getStore().state.catalogMap[ref.name]?.[ref.version]?.catalog;
    if (!fromMap) {
      throw new Error(
        `SetSelectedCatalogOperation: no catalog in catalog map for ${ref.name}@${ref.version}; pass catalog or load from disk first`,
      );
    }

    this.catalogsStore.getStore().setSelectedRef(ref);
    this.catalogsStore.getStore().setCatalog(fromMap);
  }
}
