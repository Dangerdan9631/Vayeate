import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schemas';

@singleton()
export class ValidateCanLockTemplate {
  test(template: Template | null | undefined): boolean {
    return !!template && !template.locked;
  }
}
