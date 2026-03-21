import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class RemoveContrastVariable {
  execute(template: Template, key: string): Template {
  return {
    ...template,
    contrastVariables: template.contrastVariables.filter((v) => v.key !== key),
  };
  }
}
