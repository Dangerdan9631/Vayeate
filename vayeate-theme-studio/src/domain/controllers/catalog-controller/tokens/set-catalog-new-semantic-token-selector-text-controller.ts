import { singleton } from 'tsyringe';
import { SetCatalogNewSemanticTokenSelectorTextOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogNewSemanticTokenSelectorTextController {
  constructor(
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextOperation,
  ) {}

  run(value: string): void {
    this.setCatalogNewSemanticTokenSelectorText.execute(value);
  }
}
