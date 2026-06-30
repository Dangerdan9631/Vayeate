import { singleton } from 'tsyringe';
import type { StyleVariableKey } from '../../../../model/schema/primitives';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Updates template mapping style variable filter in the UI store.
 */
@singleton()
export class SetTemplateMappingStyleVariableFilterOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template mapping style variable filter mutation.
   * @param values Selected style variable keys.
   */
  execute(values: StyleVariableKey[]): void {
    this.templateUiStore.getStore().setMappingStyleVariableFilter(values);
  }
}
