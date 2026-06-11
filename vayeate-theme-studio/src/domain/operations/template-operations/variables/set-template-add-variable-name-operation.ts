import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Store draft value for the "add variable" name input.
 */
@singleton()
export class SetTemplateAddVariableNameOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template add variable name mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.templateUiStore.getStore().setAddVariableName(value);
  }
}

