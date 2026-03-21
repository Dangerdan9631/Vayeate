import { injectable } from 'tsyringe';
import type { TokenType } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogNewSourceTokenType {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: TokenType): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG_NEW_SOURCE_TOKEN_TYPE', value });
  }
}



