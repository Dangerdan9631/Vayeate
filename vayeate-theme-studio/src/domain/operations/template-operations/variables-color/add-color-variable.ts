import type { ColorVariable, Template } from '../../../../model/schemas';

export function addColorVariableToTemplate(
  template: Template,
  key: string,
  groupRef?: string | null,
): Template {
  const newVars: ColorVariable[] = [
    ...template.colorVariables,
    { key, groupRef: groupRef ?? null },
  ];
  return { ...template, colorVariables: newVars };
}
