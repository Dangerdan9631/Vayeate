import type { Template } from '../../model/schema/template-schemas';

/**
 * Collects mapping and variable group names referenced by a template.
 *
 * @param t - Template whose mappings and variable group refs are scanned.
 * @returns Set of non-null group names in use across the template definition.
 */
export function groupNamesInUseFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.groupRef) s.add(m.groupRef);
  }
  for (const v of t.colorVariables) {
    if (v.groupRef) s.add(v.groupRef);
  }
  for (const v of t.contrastVariables) {
    if (v.groupRef) s.add(v.groupRef);
  }
  return s;
}
