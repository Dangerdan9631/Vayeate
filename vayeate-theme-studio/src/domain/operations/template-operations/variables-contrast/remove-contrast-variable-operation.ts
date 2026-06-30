import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Removes contrast variable from the parent entity in the store.
 */

@singleton()
export class RemoveContrastVariableOperation {

  /**
   * Runs the remove contrast variable mutation.
   * @param template Template (Template).
   * @param key Key (string).
   * @returns Template result.
   */
  execute(template: Template, key: string): Template {
  return {
    ...template,
    contrastVariables: template.contrastVariables.filter((v) => v.key !== key),
  };
  }
}
