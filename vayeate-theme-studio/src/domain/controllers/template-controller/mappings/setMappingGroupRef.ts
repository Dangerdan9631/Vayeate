import type { TokenType } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  applyMappingGroupRef,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function setMappingGroupRef(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
  groupRef: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = bumpTemplateVersionForEdit(template);
  const next = applyMappingGroupRef(base, tokenKey, tokenType, groupRef);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
