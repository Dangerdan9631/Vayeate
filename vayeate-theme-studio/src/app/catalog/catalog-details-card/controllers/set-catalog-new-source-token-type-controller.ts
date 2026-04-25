import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTokenTypeOperation } from '../../../../domain/operations/catalog-operations/sources/set-catalog-new-source-token-type-operation';
import { SetCatalogNewSourceTypeOperation } from '../../../../domain/operations/catalog-operations/sources/set-catalog-new-source-type-operation';

@singleton()
export class SetCatalogNewSourceTokenTypeController {
  constructor(
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeOperation,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation,
  ) {}

  run(value: TokenType): void {
    this.setCatalogNewSourceTokenType.execute(value);
    if (value === 'semantic token') {
      this.setCatalogNewSourceType.execute('semantic-token-registry');
    } else {
      this.setCatalogNewSourceType.execute('default');
    }
  }
}
