import { injectable } from 'tsyringe';
import type { Catalog, CatalogReference } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';
import { AppStateGetter } from '../../../state/app-state-getter';

/**
 * Sets the catalog pane selection: selected ref and loaded catalog in app state.
 * When `catalog` is omitted, reads the catalog from the store entry for `ref` (must be loaded).
 */
@injectable()
export class SetSelectedCatalogOperation {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly appStateGetter: AppStateGetter,
  ) {}

  execute(ref: CatalogReference | null, catalog?: Catalog | null): void {
    if (ref === null) {
      this.appStateSetter.apply({ type: 'SET_SELECTED_REF', ref: null });
      this.appStateSetter.apply({ type: 'SET_CATALOG', catalog: null });
      return;
    }

    if (catalog !== undefined) {
      this.appStateSetter.apply({ type: 'SET_SELECTED_REF', ref });
      this.appStateSetter.apply({ type: 'SET_CATALOG', catalog });
      return;
    }

    const fromStore = this.appStateGetter.current().store.catalogs[ref.name]?.[ref.version]?.catalog;
    if (!fromStore) {
      throw new Error(
        `SetSelectedCatalogOperation: no catalog in store for ${ref.name}@${ref.version}; pass catalog or load from disk first`,
      );
    }

    this.appStateSetter.apply({ type: 'SET_SELECTED_REF', ref });
    this.appStateSetter.apply({ type: 'SET_CATALOG', catalog: fromStore });
  }
}
