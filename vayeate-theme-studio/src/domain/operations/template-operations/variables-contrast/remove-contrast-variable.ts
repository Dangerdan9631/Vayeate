import type { Template } from '../../../../model/schemas';

export function removeContrastVariableFromTemplate(template: Template, key: string): Template {
  return {
    ...template,
    contrastVariables: template.contrastVariables.filter((v) => v.key !== key),
  };
}
