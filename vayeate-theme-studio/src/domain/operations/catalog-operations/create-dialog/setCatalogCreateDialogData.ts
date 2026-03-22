import { injectable } from 'tsyringe';
import type { CatalogType } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

export type SetCatalogCreateDialogDataOptions = {
  name?: string;
  type?: CatalogType;
};

@injectable()
export class SetCatalogCreateDialogData {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(options: SetCatalogCreateDialogDataOptions): void {
    if (options.name !== undefined) {
      this.appStateSetter.apply({ type: 'SET_CATALOG_CREATE_FORM_NAME', value: options.name });
    }
    if (options.type !== undefined) {
      this.appStateSetter.apply({ type: 'SET_CATALOG_CREATE_FORM_TYPE', value: options.type });
    }
  }
}
