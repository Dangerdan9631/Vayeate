import type { ColorVariableKey } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  applyContrastComparisonSourceUpdate,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function updateContrastComparisonSource(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  contrastVariableKey: string,
  comparisonSourceRef: ColorVariableKey | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = bumpTemplateVersionForEdit(template);
  const next = applyContrastComparisonSourceUpdate(base, contrastVariableKey, comparisonSourceRef);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
