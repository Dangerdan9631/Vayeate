import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTokenTypeOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewSourceTokenTypeController {
  constructor(private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeOperation) {}

  run(value: TokenType): void {
    this.setCatalogNewSourceTokenType.execute(value);
  }
}
