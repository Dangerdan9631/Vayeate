import type { TokenType } from '../../model/schemas';
import { parseSemanticSelector } from '../../core/semantic-token';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function setMappingGroupRef(
  setState: SetState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
  groupRef: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  let semanticBaseType: string | null = null;
  if (tokenType === 'semantic token') {
    try {
      const parsed = parseSemanticSelector(tokenKey);
      const isBase =
        parsed.modifiers.length === 0 &&
        (parsed.language === null || parsed.language === '');
      if (isBase) semanticBaseType = parsed.type;
    } catch {
      /* not a valid semantic selector */
    }
  }
  const newMappings = base.mappings.map((m) => {
    if (m.token.type !== tokenType) return m;
    if (tokenType === 'semantic token' && semanticBaseType !== null) {
      try {
        const p = parseSemanticSelector(m.token.key);
        if (p.type === semanticBaseType) return { ...m, groupRef };
      } catch {
        /* ignore */
      }
      return m;
    }
    if (m.token.key === tokenKey) return { ...m, groupRef };
    return m;
  });
  await saveTemplateOp({ ...base, mappings: newMappings });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
