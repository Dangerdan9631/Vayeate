import { injectable } from 'tsyringe';
import type { Catalog, CatalogReference } from '../../../../model/schemas';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';

/**
 * Sets the catalog pane selection: selected ref and loaded catalog in app state.
 * When `catalog` is omitted, reads the catalog from the catalog map entry for `ref` (must be loaded).
 */
@injectable()
export class SetSelectedCatalogOperation {
  constructor(
    private readonly catalogsStateSetter: CatalogsStateSetter,
    private readonly catalogsStateGetter: CatalogsStateGetter,
  ) {}

  execute(ref: CatalogReference | null, catalog?: Catalog | null): void {
    if (ref === null) {
      this.catalogsStateSetter.apply({ type: 'SET_SELECTED_REF', ref: null });
      this.catalogsStateSetter.apply({ type: 'SET_CATALOG', catalog: null });
      return;
    }

    if (catalog !== undefined) {
      this.catalogsStateSetter.apply({ type: 'SET_SELECTED_REF', ref });
      this.catalogsStateSetter.apply({ type: 'SET_CATALOG', catalog });
      return;
    }

    const fromMap = this.catalogsStateGetter.current().catalogMap[ref.name]?.[ref.version]?.catalog;
    if (!fromMap) {
      throw new Error(
        `SetSelectedCatalogOperation: no catalog in catalog map for ${ref.name}@${ref.version}; pass catalog or load from disk first`,
      );
    }

    this.catalogsStateSetter.apply({ type: 'SET_SELECTED_REF', ref });
    this.catalogsStateSetter.apply({ type: 'SET_CATALOG', catalog: fromMap });
  }
}
