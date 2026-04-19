import { singleton } from 'tsyringe';
import { SetCatalogTokensSearchTextOperation } from '../../../domain/operations/catalog-operations/tokens/set-catalog-tokens-search-text-operation';

@singleton()
export class SetCatalogTokensSearchTextController {
  constructor(private readonly setCatalogTokensSearchText: SetCatalogTokensSearchTextOperation) {}

  run(value: string): void {
    this.setCatalogTokensSearchText.execute(value);
  }
}
