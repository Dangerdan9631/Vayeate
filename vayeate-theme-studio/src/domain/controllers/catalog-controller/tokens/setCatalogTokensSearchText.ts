import { singleton } from 'tsyringe';
import { SetCatalogTokensSearchText } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogTokensSearchTextController {
  constructor(private readonly setCatalogTokensSearchText: SetCatalogTokensSearchText) {}

  run(value: string): void {
    this.setCatalogTokensSearchText.execute(value);
  }
}
