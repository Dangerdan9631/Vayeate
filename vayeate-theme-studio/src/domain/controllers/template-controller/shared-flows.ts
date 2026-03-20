import type { SetStoreState } from '../../state/store-state-reducer';
import {
  setSelectedTemplateRef,
  loadTemplate,
  refreshTemplateRefs,
  type SetState,
} from '../../operations/template-operations';

export async function refreshRefsAndSelect(
  setState: SetState,
  setStoreState: SetStoreState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> {
  const refs = await refreshTemplateRefs(setStoreState);
  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      setSelectedTemplateRef(setState, match);
      await loadTemplate(setState, match.name, match.version);
    }
  }
}
