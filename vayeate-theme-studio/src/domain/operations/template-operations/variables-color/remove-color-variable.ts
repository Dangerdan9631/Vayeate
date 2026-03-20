import type { Template } from '../../../../model/schemas';

export function removeColorVariableFromTemplate(template: Template, key: string): Template {
  return {
    ...template,
    colorVariables: template.colorVariables.filter((v) => v.key !== key),
  };
}
