import { singleton } from 'tsyringe';
import { SetCatalogNewSemanticTokenSelectorTextOperation } from '../../../operations/catalog-operations/tokens/set-catalog-new-semantic-token-selector-text-operation';

@singleton()
export class SetCatalogNewSemanticTokenSelectorTextController {
  constructor(
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextOperation,
  ) {}

  async run(value: string): Promise<void> {
    this.setCatalogNewSemanticTokenSelectorText.execute(value);
  }
}
