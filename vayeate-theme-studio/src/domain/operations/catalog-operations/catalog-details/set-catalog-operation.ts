import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(catalog: Catalog | null): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG', catalog });
  }
}



