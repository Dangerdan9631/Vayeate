import { singleton } from 'tsyringe';
import { SetCatalogTokensSearchTextOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogTokensSearchTextController {
  constructor(private readonly setCatalogTokensSearchText: SetCatalogTokensSearchTextOperation) {}

  run(value: string): void {
    this.setCatalogTokensSearchText.execute(value);
  }
}
