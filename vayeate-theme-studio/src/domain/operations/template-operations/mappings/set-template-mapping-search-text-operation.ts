import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Updates template mapping search text in the domain or UI store.
 */

@singleton()
export class SetTemplateMappingSearchTextOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template mapping search text mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.templateUiStore.getStore().setMappingSearchText(value);
  }
}

