import { injectable } from 'tsyringe';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@injectable()
export class SetCatalogNewSemanticTokenSelectorTextOperation {
  constructor(private readonly catalogsStateSetter: CatalogsStateSetter) {}

  execute(value: string): void {
    this.catalogsStateSetter.apply({ type: 'SET_CATALOG_NEW_SEMANTIC_TOKEN_SELECTOR_TEXT', value });
  }
}
