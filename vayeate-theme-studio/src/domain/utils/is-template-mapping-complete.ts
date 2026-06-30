import type { Mapping } from '../../model/schema/template-schemas';

/**
 * Determines whether a mapping has enough variable data to be considered complete.
 *
 * A style-only mapping is complete. A contrast mapping is complete only when it
 * also has a color variable, because contrast adjusts a resolved color.
 */
export function isTemplateMappingComplete(mapping: Mapping): boolean {
  if (mapping.ignored === true) return true;
  if (mapping.contrastVariableRef && !mapping.colorVariableRef) return false;
  return mapping.colorVariableRef !== null || mapping.styleVariableRef != null;
}

/**
 * Returns whether a mapping should block template locking.
 */
export function isTemplateMappingBlockingLock(mapping: Mapping): boolean {
  return !isTemplateMappingComplete(mapping);
}
