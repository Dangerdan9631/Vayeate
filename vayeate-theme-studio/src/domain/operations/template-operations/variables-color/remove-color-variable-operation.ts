import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Removes color variable from the parent entity in the store.
 */

@singleton()
export class RemoveColorVariableOperation {

  /**
   * Runs the remove color variable mutation.
   * @param template Template (Template).
   * @param key Key (string).
   * @returns Template result.
   */
  execute(template: Template, key: string): Template {
  return {
    ...template,
    colorVariables: template.colorVariables.filter((v) => v.key !== key),
  };
  }
}
