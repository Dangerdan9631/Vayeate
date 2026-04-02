import { injectable } from 'tsyringe';
import type { SourceType } from '../../../../model/schemas';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@injectable()
export class SetCatalogNewSourceTypeOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(value: SourceType): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_NEW_SOURCE_TYPE', value });
  }
}



