import type { Template } from '../../model/schemas';

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
