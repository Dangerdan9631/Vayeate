import type { ColorVariableKey, Template } from '../../../../model/schemas';

export function applyContrastComparisonSourceUpdate(
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
