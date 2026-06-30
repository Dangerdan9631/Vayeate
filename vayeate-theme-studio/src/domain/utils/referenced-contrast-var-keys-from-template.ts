import type { Template } from '../../model/schema/template-schemas';

/**
 * Collects contrast variable keys referenced by template mappings.
 *
 * @param t - Template whose mappings are scanned for contrast variable refs.
 * @returns Set of contrast variable keys in use by at least one mapping.
 */
export function referencedContrastVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.ignored === true) continue;
    if (m.contrastVariableRef) s.add(m.contrastVariableRef);
  }
  return s;
}
