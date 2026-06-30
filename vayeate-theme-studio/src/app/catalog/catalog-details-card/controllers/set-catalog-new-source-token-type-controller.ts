import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTokenTypeOperation } from '../../../../domain/operations/catalog-operations/sources/set-catalog-new-source-token-type-operation';
import { SetCatalogNewSourceTypeOperation } from '../../../../domain/operations/catalog-operations/sources/set-catalog-new-source-type-operation';

/**
 * Stores new-source token type and aligns default source type with the selection.
 */
@singleton()
export class SetCatalogNewSourceTokenTypeController {
  constructor(
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeOperation,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation,
  ) {}

  /**
   * Updates pending new-source token type and compatible source type defaults.
   * @param value - Selected token type for the new source.
   */
  run(value: TokenType): void {
    this.setCatalogNewSourceTokenType.execute(value);
    if (value === 'semantic token') {
      this.setCatalogNewSourceType.execute('semantic-token-registry');
    } else {
      this.setCatalogNewSourceType.execute('default');
    }
  }
}
