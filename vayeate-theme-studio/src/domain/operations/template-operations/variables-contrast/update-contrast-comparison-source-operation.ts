import { injectable } from 'tsyringe';
import type { ColorVariableKey, Template } from '../../../../model/schemas';

@injectable()
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
