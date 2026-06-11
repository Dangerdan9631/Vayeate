import { singleton } from 'tsyringe';
import { SetCatalogNewSemanticTokenSelectorTextOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-new-semantic-token-selector-text-operation';

/**
 * Updates the pending semantic selector text on the tokens card.
 */
@singleton()
export class SetCatalogNewSemanticTokenSelectorTextController {
  constructor(
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextOperation,
  ) {}

  /**
   * Stores semantic selector text before add is committed.
   * @param value - Selector text from the semantic token add input.
   */
  run(value: string): void {
    this.setCatalogNewSemanticTokenSelectorText.execute(value);
  }
}
