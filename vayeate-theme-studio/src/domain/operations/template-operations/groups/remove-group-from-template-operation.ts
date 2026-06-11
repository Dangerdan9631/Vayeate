import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Removes group from template from the parent entity in the store.
 */

@singleton()
export class RemoveGroupFromTemplateOperation {

  /**
   * Runs the remove group from template mutation.
   * @param template Template (Template).
   * @param groupName Group name (string).
   * @returns Template result.
   */
  execute(template: Template, groupName: string): Template {
    return {
      ...template,
      groups: (template.groups ?? []).filter((g) => g !== groupName),
    };
  }
}
