import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Updates template mapping token group selection in the domain or UI store.
 */

@singleton()
export class SetTemplateMappingTokenGroupSelectionOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template mapping token group selection mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.templateUiStore.getStore().setMappingTokenGroupSelection(value);
  }
}

