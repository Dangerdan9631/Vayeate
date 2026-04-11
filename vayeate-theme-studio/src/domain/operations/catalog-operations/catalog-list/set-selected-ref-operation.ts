import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class SetSelectedRefOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(ref: CatalogReference | null): void {
    this.CatalogsStateSetter.apply({ type: 'SET_SELECTED_REF', ref });
  }
}



