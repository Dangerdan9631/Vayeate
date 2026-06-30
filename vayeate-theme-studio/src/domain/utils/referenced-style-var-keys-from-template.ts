import type { Template } from '../../model/schema/template-schemas';

/**
 * Collects style variable keys referenced by template mappings.
 * @param template Template to inspect.
 * @returns Referenced style variable keys.
 */
export function referencedStyleVarKeysFromTemplate(template: Template): Set<string> {
  const keys = new Set<string>();
  for (const mapping of template.mappings) {
    if (mapping.ignored === true) continue;
    if (mapping.styleVariableRef) keys.add(mapping.styleVariableRef);
  }
  return keys;
}
