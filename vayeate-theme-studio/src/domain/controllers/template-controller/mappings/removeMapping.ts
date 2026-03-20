import type { TokenType } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  removeMappingFromTemplate,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function removeMapping(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = bumpTemplateVersionForEdit(template);
  const next = removeMappingFromTemplate(base, tokenKey, tokenType);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
