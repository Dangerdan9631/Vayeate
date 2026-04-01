import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogBulkAddDialogOpenOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: boolean): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG_BULK_ADD_DIALOG_OPEN', value });
  }
}

