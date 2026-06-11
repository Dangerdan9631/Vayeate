import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

/**
 * Adds group to template to the parent entity in the store.
 */

@singleton()
export class AddGroupToTemplateOperation {

  /**
   * Runs the add group to template mutation.
   * @param template Template (Template).
   * @param name Name (string).
   * @returns Template | null result.
   */
  execute(template: Template, name: string): Template | null {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = template.groups ?? [];
    if (existing.includes(trimmed)) return null;
    return { ...template, groups: [...existing, trimmed] };
  }
}
