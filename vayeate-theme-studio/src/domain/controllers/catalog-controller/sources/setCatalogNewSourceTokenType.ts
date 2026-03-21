import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTokenType } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewSourceTokenTypeController {
  constructor(private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenType) {}

  run(value: TokenType): void {
    this.setCatalogNewSourceTokenType.execute(value);
  }
}
