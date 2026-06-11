import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Updates variable group ref in the store.
 */

@singleton()
export class UpdateVariableGroupRefOperation {

  /**
   * Runs the update variable group ref mutation.
   * @param template Template (Template).
   * @param variableKey Variable key (string).
   * @param groupRef Group ref (string | null).
   * @returns Template result.
   */
  execute(
    template: Template,
    variableKey: string,
    groupRef: string | null,
  ): Template {
    const colorIdx = template.colorVariables.findIndex((v) => v.key === variableKey);
    if (colorIdx >= 0) {
      return {
        ...template,
        colorVariables: template.colorVariables.map((v) =>
          v.key === variableKey ? { ...v, groupRef } : v,
        ),
      };
    }
    return {
      ...template,
      contrastVariables: template.contrastVariables.map((v) =>
        v.key === variableKey ? { ...v, groupRef } : v,
      ),
    };
  }
}
