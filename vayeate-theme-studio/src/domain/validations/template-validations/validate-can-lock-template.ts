import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schema/template-schemas';

@singleton()
export class ValidateCanLockTemplate {
  test(template: Template | null | undefined): boolean {
    return !!template && !template.locked;
  }
}
