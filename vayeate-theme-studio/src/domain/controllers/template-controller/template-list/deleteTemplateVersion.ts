import { findNearestVersionRef } from '../../../utils/version';
import { templateStackId } from '../../../utils/stack-id';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  deleteTemplate as deleteTemplateOp,
  setSelectedTemplateRef,
  setTemplate,
  loadTemplate,
  refreshTemplateRefs,
  type SetState,
} from '../../../operations/template-operations';
import { setCurrentUndoStackId } from '../../../operations/undo-operations';

export async function deleteTemplateVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  name: string,
  version: string,
): Promise<void> {
  await deleteTemplateOp(name, version);
  const refs = await refreshTemplateRefs(setStoreState);
  const nextT = findNearestVersionRef(refs, name, version);

  if (nextT) {
    setSelectedTemplateRef(setState, nextT);
    await loadTemplate(setState, nextT.name, nextT.version);
    setCurrentUndoStackId(setState, templateStackId(nextT.name, nextT.version));
  } else {
    setSelectedTemplateRef(setState, null);
    setTemplate(setState, null);
    setCurrentUndoStackId(setState, null);
  }
}

