import { singleton } from 'tsyringe';
import type { Mapping } from '../../../../model/Template/schema/template-schemas';

/**
 * Checks whether a template mapping has enough variable data to be complete.
 */
@singleton()
export class ValidateIsTemplateMappingComplete {
  /**
   * A style-only mapping is complete; a contrast mapping also needs a color variable.
   * @param mapping Mapping to inspect.
   * @returns True when the mapping should not block template locking.
   */
  test(mapping: Mapping): boolean {
    if (mapping.ignored === true) return true;
    if (mapping.contrastVariableRef && !mapping.colorVariableRef) return false;
    return mapping.colorVariableRef !== null || mapping.styleVariableRef != null;
  }
}
