import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/**
 * Updates template mapping color variable filter in the domain or UI store.
 */

@singleton()
export class SetTemplateMappingColorVariableFilterOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template mapping color variable filter mutation.
   * @param values Values (ColorVariableKey[]).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(values: ColorVariableKey[]): void {
    this.templateUiStore.getStore().setMappingColorVariableFilter(values);
  }
}



