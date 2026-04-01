import { injectable } from 'tsyringe';
import type { SourceType } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogNewSourceTypeOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: SourceType): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG_NEW_SOURCE_TYPE', value });
  }
}



