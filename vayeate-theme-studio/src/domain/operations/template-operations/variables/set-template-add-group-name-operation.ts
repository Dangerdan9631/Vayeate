import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Store draft value for the "add group" name input.
 */
@singleton()
export class SetTemplateAddGroupNameOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template add group name mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.templateUiStore.getStore().setAddGroupName(value);
  }
}

