import { singleton } from 'tsyringe';
import { SetCatalogTokensSearchTextOperation } from '../../../operations/catalog-operations/tokens/set-catalog-tokens-search-text-operation';

@singleton()
export class SetCatalogTokensSearchTextController {
  constructor(private readonly setCatalogTokensSearchText: SetCatalogTokensSearchTextOperation) {}

  async run(value: string): Promise<void> {
    this.setCatalogTokensSearchText.execute(value);
  }
}
