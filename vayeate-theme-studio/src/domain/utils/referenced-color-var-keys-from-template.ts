import type { Template } from '../../model/schema/template-schemas';

export function referencedColorVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.colorVariableRef) s.add(m.colorVariableRef);
  }
  for (const cv of t.contrastVariables) {
    if (cv.comparisonSourceRef) s.add(cv.comparisonSourceRef);
  }
  return s;
}
