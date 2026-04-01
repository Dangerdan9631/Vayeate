import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogNewTokenKeyOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG_NEW_TOKEN_KEY', value });
  }
}

