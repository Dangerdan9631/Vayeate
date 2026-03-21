import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class LockTemplate {
  execute(template: Template): Template {
    return { ...template, locked: true };
  }
}
