import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../../model/Common/schema/primitives';
import { TemplateUiStore } from '../../../../state/Template/ui/template-ui-store';

/**
 * Updates template mapping contrast variable filter in the domain or UI store.
 */

@singleton()
export class SetTemplateMappingContrastVariableFilterOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template mapping contrast variable filter mutation.
   * @param values Values (ContrastVariableKey[]).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(values: ContrastVariableKey[]): void {
    this.templateUiStore.getStore().setMappingContrastVariableFilter(values);
  }
}



