import type { TemplateReference } from '../../../model/schemas';
import type { SetStoreState } from '../../state/store-state-reducer';

export function setTemplateRefs(setStoreState: SetStoreState, refs: TemplateReference[]): void {
  setStoreState({
    type: 'SET_STORE_TEMPLATE_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
  });
}
