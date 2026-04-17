import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import type { Template } from '../../../../model/schema/template-schemas';

@singleton()
export class UpdateContrastComparisonSourceOperation {
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
