import { injectable } from 'tsyringe';
import type { CatalogType } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogCreateFormType {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: CatalogType): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG_CREATE_FORM_TYPE', value });
  }
}



