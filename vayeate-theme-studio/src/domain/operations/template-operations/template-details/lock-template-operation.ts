import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

@singleton()
export class LockTemplateOperation {
  execute(template: Template): Template {
    return { ...template, locked: true };
  }
}
