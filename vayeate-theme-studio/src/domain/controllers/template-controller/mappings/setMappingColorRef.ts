import type { ColorVariableKey } from '../../../../model/schemas';
import type { TokenType } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  removeMappingFromTemplate,
  applyMappingColorRef,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function setMappingColorRef(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  tokenKey: string,
  tokenType: TokenType,
  colorRef: ColorVariableKey | null,
  isOrphan?: boolean,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = bumpTemplateVersionForEdit(template);
  if (colorRef === null && isOrphan) {
    const next = removeMappingFromTemplate(base, tokenKey, tokenType);
    await saveTemplateOp(next);
    await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
    return;
  }
  const next = applyMappingColorRef(base, tokenKey, tokenType, colorRef);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
