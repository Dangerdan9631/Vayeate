import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Locks template to prevent concurrent edits.
 */

@singleton()
export class LockTemplateOperation {

  /**
   * Runs the lock template mutation.
   * @param template Template (Template).
   * @returns Template result.
   */
  execute(template: Template): Template {
    return { ...template, locked: true };
  }
}
