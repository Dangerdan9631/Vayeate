import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class RemoveColorVariableOperation {
  execute(template: Template, key: string): Template {
  return {
    ...template,
    colorVariables: template.colorVariables.filter((v) => v.key !== key),
  };
  }
}
