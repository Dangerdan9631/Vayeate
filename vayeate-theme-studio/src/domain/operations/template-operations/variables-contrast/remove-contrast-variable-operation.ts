import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

@singleton()
export class RemoveContrastVariableOperation {
  execute(template: Template, key: string): Template {
  return {
    ...template,
    contrastVariables: template.contrastVariables.filter((v) => v.key !== key),
  };
  }
}
