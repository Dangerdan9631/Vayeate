import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schema/template-schemas';

/**
 * Checks that a template exists and is not already locked before a lock mutation.
 */
@singleton()
export class ValidateCanLockTemplate {
  /**
   * Confirms the template is present and unlocked.
   *
   * @param template - Template to lock, or null/undefined when none is selected.
   * @returns `true` when a template is selected and `locked` is false.
   */
  test(template: Template | null | undefined): boolean {
    return !!template && !template.locked;
  }
}
