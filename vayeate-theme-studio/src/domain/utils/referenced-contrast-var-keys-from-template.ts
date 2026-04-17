import type { Template } from '../../model/schema/template-schemas';

export function referencedContrastVarKeysFromTemplate(t: Template): Set<string> {
  const s = new Set<string>();
  for (const m of t.mappings) {
    if (m.contrastVariableRef) s.add(m.contrastVariableRef);
  }
  return s;
}
