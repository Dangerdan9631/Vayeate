import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Removes style variable from the parent entity in the store.
 */
@singleton()
export class RemoveStyleVariableOperation {
  /**
   * Runs the remove style variable mutation.
   * @param template Template.
   * @param key Variable key.
   * @returns Template result.
   */
  execute(template: Template, key: string): Template {
    return {
      ...template,
      styleVariables: (template.styleVariables ?? []).filter((v) => v.key !== key),
    };
  }
}
