import { singleton } from 'tsyringe';
import { SetCatalogNewSemanticTokenSelectorTextOperation } from '../../../domain/operations/catalog-operations/tokens/set-catalog-new-semantic-token-selector-text-operation';

@singleton()
export class SetCatalogNewSemanticTokenSelectorTextController {
  constructor(
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextOperation,
  ) {}

  run(value: string): void {
    this.setCatalogNewSemanticTokenSelectorText.execute(value);
  }
}
