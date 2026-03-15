import { compareVersions } from '../../utils/version';
import {
  deleteTemplate as deleteTemplateOp,
  setSelectedTemplateRef,
  setTemplate,
  loadTemplate,
  refreshTemplateRefs,
  type SetState,
} from '../../operations/template-operations';
import { setCurrentUndoStackId } from '../../operations/undo-operations';
import { templateStackId } from './templateStackId';

export async function deleteTemplateVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteTemplateOp(name, version);
  const refs = await refreshTemplateRefs(setState);

  const sameName = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lowerT = sameName.filter((r) => compareVersions(r.version, version) < 0);
  const higherT = sameName.filter((r) => compareVersions(r.version, version) > 0);
  const nextT =
    lowerT.length > 0 ? lowerT[lowerT.length - 1] : higherT.length > 0 ? higherT[0] : null;

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
