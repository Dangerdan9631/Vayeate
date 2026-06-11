import { singleton } from 'tsyringe';
import { SetCatalogTokensSearchTextOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-tokens-search-text-operation';

/**
 * Updates the tokens card search filter in catalog UI state.
 */
@singleton()
export class SetCatalogTokensSearchTextController {
  constructor(private readonly setCatalogTokensSearchText: SetCatalogTokensSearchTextOperation) {}

  /**
   * Stores the current search query for token list filtering.
   * @param value - Search text from the tokens card input.
   */
  run(value: string): void {
    this.setCatalogTokensSearchText.execute(value);
  }
}
