import { singleton } from 'tsyringe';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class CloseCatalogCreateDialogOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
  }
}
