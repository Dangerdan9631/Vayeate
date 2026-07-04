import { singleton } from 'tsyringe';
import type { Mapping, Template } from '../../../../model/Template/schema/template-schemas';

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
    return !!template && !template.locked && template.mappings.every((mapping) => this.isMappingComplete(mapping));
  }

  private isMappingComplete(mapping: Mapping): boolean {
    if (mapping.ignored === true) return true;
    if (mapping.contrastVariableRef && !mapping.colorVariableRef) return false;
    return mapping.colorVariableRef !== null || mapping.styleVariableRef != null;
  }
}
