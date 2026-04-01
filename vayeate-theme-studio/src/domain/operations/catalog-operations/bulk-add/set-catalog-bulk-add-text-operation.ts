import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogBulkAddTextOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG_BULK_ADD_TEXT', value });
  }
}

