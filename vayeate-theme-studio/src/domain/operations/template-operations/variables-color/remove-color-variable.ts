import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class RemoveColorVariable {
  execute(template: Template, key: string): Template {
  return {
    ...template,
    colorVariables: template.colorVariables.filter((v) => v.key !== key),
  };
  }
}
