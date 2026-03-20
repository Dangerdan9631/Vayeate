import type { Template } from '../../../../model/schemas';

export function updateVariableGroupRef(
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
