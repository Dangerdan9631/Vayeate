import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Updates contrast comparison source in the store.
 */

@singleton()
export class UpdateContrastComparisonSourceOperation {

  /**
   * Runs the update contrast comparison source mutation.
   * @param template Template (Template).
   * @param contrastVariableKey Contrast variable key (string).
   * @param comparisonSourceRef Comparison source ref (ColorVariableKey | null).
   * @returns Template result.
   */
  execute(
  template: Template,
  contrastVariableKey: string,
  comparisonSourceRef: ColorVariableKey | null,
  ): Template {
  return {
    ...template,
    contrastVariables: template.contrastVariables.map((v) =>
      v.key === contrastVariableKey ? { ...v, comparisonSourceRef } : v,
    ),
  };
  }
}
