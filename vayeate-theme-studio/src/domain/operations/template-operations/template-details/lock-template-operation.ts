import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class LockTemplateOperation {
  execute(template: Template): Template {
    return { ...template, locked: true };
  }
}
