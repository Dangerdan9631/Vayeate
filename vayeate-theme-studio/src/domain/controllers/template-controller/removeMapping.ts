import type { TokenType } from '../../../model/schemas';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function removeMapping(
  setState: SetState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newMappings = base.mappings.filter(
    (m) => !(m.token.key === tokenKey && m.token.type === tokenType),
  );
  await saveTemplateOp({ ...base, mappings: newMappings });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
