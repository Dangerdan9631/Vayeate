import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@singleton()
export class RemoveColorVariableOperation {
  execute(template: Template, key: string): Template {
  return {
    ...template,
    colorVariables: template.colorVariables.filter((v) => v.key !== key),
  };
  }
}
