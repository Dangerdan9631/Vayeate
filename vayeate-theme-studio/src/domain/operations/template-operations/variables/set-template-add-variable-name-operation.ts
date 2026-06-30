import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';
import type { TemplateVariableKind } from '../../../../model/template-variable-kind';
import { getTemplateAddVariableDraftKey } from '../../../state/ui/template-ui-state';

/**
 * Store draft value for the "add variable" name input.
 */
@singleton()
export class SetTemplateAddVariableNameOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  /**
   * Runs the set template add variable name mutation.
   * @param variableKind Variable kind for the targeted add input.
   * @param groupRef Group ref for the targeted add input.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(variableKind: TemplateVariableKind, groupRef: string | null, value: string): void {
    this.templateUiStore.getStore().setAddVariableName(
      getTemplateAddVariableDraftKey(variableKind, groupRef),
      value,
    );
  }
}

