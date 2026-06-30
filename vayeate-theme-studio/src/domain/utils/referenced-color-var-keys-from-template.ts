import type { Template } from '../../model/schema/template-schemas';

/**
 * Collects color variable keys referenced by mappings and contrast comparison sources.
 *
 * @param t - Template whose mappings and contrast variables are scanned.
 * @returns Set of color variable keys required by the template definition.
 */
export function referencedColorVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.ignored === true) continue;
    if (m.colorVariableRef) s.add(m.colorVariableRef);
  }
  for (const cv of t.contrastVariables) {
    if (cv.comparisonSourceRef) s.add(cv.comparisonSourceRef);
  }
  return s;
}
